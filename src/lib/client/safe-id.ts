export function createSafeId() {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }

  if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
    const values = new Uint32Array(4);
    cryptoObject.getRandomValues(values);

    return Array.from(values)
      .map((value) => value.toString(16).padStart(8, "0"))
      .join("-");
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}
