export interface GeminiKeyStatus {
  keyIndex: number;
  maskedKey: string;
  isHealthy: boolean;
  requestsCount: number;
  lastUsedAt: string | null;
  cooldownUntil: number | null;
}

class GeminiKeyPool {
  private keys: string[] = [];
  private currentIndex: number = 0;
  private keyStats: Map<number, { requests: number; lastUsed: number; cooldownUntil: number }> = new Map();

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    const rawKeys = process.env.GEMINI_API_KEYS || "";
    this.keys = rawKeys
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 5);

    this.keys.forEach((_, idx) => {
      this.keyStats.set(idx, { requests: 0, lastUsed: 0, cooldownUntil: 0 });
    });
  }

  public getPoolStatus(): { totalKeys: number; keys: GeminiKeyStatus[]; totalRequests: number } {
    if (this.keys.length === 0) {
      this.loadKeys();
    }

    const now = Date.now();
    let totalRequests = 0;

    const keys: GeminiKeyStatus[] = this.keys.map((key, idx) => {
      const stats = this.keyStats.get(idx) || { requests: 0, lastUsed: 0, cooldownUntil: 0 };
      totalRequests += stats.requests;
      const isHealthy = stats.cooldownUntil <= now;

      return {
        keyIndex: idx + 1,
        maskedKey: `${key.slice(0, 10)}...${key.slice(-6)}`,
        isHealthy,
        requestsCount: stats.requests,
        lastUsedAt: stats.lastUsed ? new Date(stats.lastUsed).toLocaleTimeString() : null,
        cooldownUntil: stats.cooldownUntil > now ? stats.cooldownUntil : null,
      };
    });

    return {
      totalKeys: this.keys.length,
      keys,
      totalRequests,
    };
  }

  private getNextAvailableKeyIndex(): number {
    if (this.keys.length === 0) {
      this.loadKeys();
    }
    if (this.keys.length === 0) {
      throw new Error("No Gemini API keys configured in GEMINI_API_KEYS");
    }

    const now = Date.now();
    // Search for a healthy key starting from current index
    for (let i = 0; i < this.keys.length; i++) {
      const candidateIndex = (this.currentIndex + i) % this.keys.length;
      const stats = this.keyStats.get(candidateIndex);
      if (!stats || stats.cooldownUntil <= now) {
        this.currentIndex = (candidateIndex + 1) % this.keys.length;
        return candidateIndex;
      }
    }

    // If all are in cooldown, pick the one that will recover the earliest
    let earliestIndex = 0;
    let earliestTime = Infinity;
    this.keyStats.forEach((stats, idx) => {
      if (stats.cooldownUntil < earliestTime) {
        earliestTime = stats.cooldownUntil;
        earliestIndex = idx;
      }
    });

    return earliestIndex;
  }

  public async generateContent({
    prompt,
    model = "gemini-2.0-flash-lite", // Fallback to supported Google endpoint
    systemInstruction,
    responseSchema,
    temperature = 0.2,
  }: {
    prompt: string;
    model?: string;
    systemInstruction?: string;
    responseSchema?: any;
    temperature?: number;
  }): Promise<string> {
    if (this.keys.length === 0) {
      this.loadKeys();
    }

    const maxAttempts = Math.min(this.keys.length, 5);
    let lastError: any = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const keyIndex = this.getNextAvailableKeyIndex();
      const apiKey = this.keys[keyIndex];
      const stats = this.keyStats.get(keyIndex) || { requests: 0, lastUsed: 0, cooldownUntil: 0 };

      stats.requests += 1;
      stats.lastUsed = Date.now();
      this.keyStats.set(keyIndex, stats);

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload: any = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
          },
        };

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        if (responseSchema) {
          payload.generationConfig.responseMimeType = "application/json";
          payload.generationConfig.responseSchema = responseSchema;
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.status === 429) {
          console.warn(`Gemini Key #${keyIndex + 1} hit 429 rate limit. Cooling down for 60s & rotating.`);
          stats.cooldownUntil = Date.now() + 60000;
          this.keyStats.set(keyIndex, stats);
          continue; // Instantly retry with next key in 0ms
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(`Gemini API Error (${res.status}): ${JSON.stringify(errData)}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return text;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} failed on key #${keyIndex + 1}:`, err?.message);
      }
    }

    throw lastError || new Error("All Gemini API keys failed or are exhausted");
  }
}

export const geminiPool = new GeminiKeyPool();
