// In-Memory High-Performance TTL Cache for Google Classroom API responses
// Drastically eliminates redundant round-trips to Google datacenters

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ApiCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached data if valid, otherwise undefined
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with a time-to-live in seconds (default 90s)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 90): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidate specific cache keys or all keys matching a prefix
   */
  invalidate(keyOrPrefix: string): void {
    for (const k of this.cache.keys()) {
      if (k === keyOrPrefix || k.startsWith(keyOrPrefix)) {
        this.cache.delete(k);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCacheManager();
