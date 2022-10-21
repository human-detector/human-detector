export function stringToBytes(s: string): Uint8Array {
  return Uint8Array.from(s.split('').map((x) => x.charCodeAt(0)));
}
