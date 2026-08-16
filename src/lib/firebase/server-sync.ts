const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "indiasgotlatent-be0ed";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDzq_eWdmloU53_6SPxzszZ33qR3PH0TEM";

/**
 * Parses Firestore REST document format into standard JavaScript object
 */
function fromFirestoreFormat(fields: Record<string, any>): any {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if ("stringValue" in val) {
      try {
        result[key] = JSON.parse(val.stringValue);
      } catch {
        result[key] = val.stringValue;
      }
    } else if ("booleanValue" in val) {
      result[key] = val.booleanValue;
    } else if ("integerValue" in val) {
      result[key] = parseInt(val.integerValue, 10);
    } else if ("doubleValue" in val) {
      result[key] = parseFloat(val.doubleValue);
    } else if ("mapValue" in val) {
      result[key] = fromFirestoreFormat(val.mapValue.fields || {});
    } else if ("arrayValue" in val) {
      result[key] = (val.arrayValue.values || []).map((item: any) => {
        if ("stringValue" in item) {
          try { return JSON.parse(item.stringValue); } catch { return item.stringValue; }
        }
        return item;
      });
    }
  }
  return result;
}

/**
 * Encodes JavaScript object into Firestore REST format
 */
function toFirestoreFormat(data: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "string") {
      fields[key] = { stringValue: val };
    } else if (typeof val === "boolean") {
      fields[key] = { booleanValue: val };
    } else if (typeof val === "number") {
      fields[key] = { doubleValue: val };
    } else if (Array.isArray(val) || typeof val === "object") {
      // Store complex arrays/objects as stringified JSON strings for high-fidelity cross-device sync
      fields[key] = { stringValue: JSON.stringify(val) };
    }
  }
  return fields;
}

/**
 * Fetches student academic state directly from Firestore Cloud Database
 */
export async function getStudentCloudStateServer(studentId: string = "default_student"): Promise<Record<string, any>> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/students/${studentId}?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return {};
    const json = await res.json();
    if (!json.fields) return {};

    return fromFirestoreFormat(json.fields);
  } catch (err) {
    console.warn("Server Firestore fetch error:", err);
    return {};
  }
}

/**
 * Saves student academic state directly to Firestore Cloud Database from Server API routes
 */
export async function saveStudentCloudStateServer(data: Record<string, any>, studentId: string = "default_student"): Promise<boolean> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/students/${studentId}?key=${API_KEY}`;
    const fields = toFirestoreFormat(data);

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });

    return res.ok;
  } catch (err) {
    console.warn("Server Firestore save error:", err);
    return false;
  }
}
