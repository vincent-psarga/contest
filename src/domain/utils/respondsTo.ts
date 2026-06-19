export function respondsTo<T>(tbd: unknown, fn: keyof T): tbd is T {
  if (tbd == null || typeof tbd !== "object") {
    return false;
  }

  const asT = tbd as { [fn]: unknown };
  return typeof asT[String(fn)] === "function";
}
