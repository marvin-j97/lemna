export function formatJson<T>(json: T): string {
  return JSON.stringify(json, null, 2);
}
