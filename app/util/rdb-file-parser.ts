export function rdbParser(
  file: Buffer
): Record<string, { value: string; expiresAt: null | number }> {
  const result: Record<string, { value: string; expiresAt: null | number }> =
    {};
  let offset = 9; // Skip "REDIS" + version

  // Helper function to read length-encoded strings
  const readString = (): { str: string; bytesRead: number } => {
    const length = file[offset]!;
    const str = Buffer.from(
      Uint8Array.prototype.slice.call(file, offset + 1, offset + length + 1)
    ).toString("utf8");
    return { str, bytesRead: length + 1 };
  };

  while (offset < file.length && file[offset] !== 0xff) {
    if (file[offset] === 0xfb) {
      offset += 3;

      // Key-value pairs follow
      while (file[offset] !== 0xff && offset < file.length) {
        // Read key
        let expiry = null;
        if (file[offset] == 0xfc) {
          const expiryMillis = file.readBigUInt64LE(offset + 1);
          expiry = Number(expiryMillis);
          offset += 9;
        }
        if (file[offset] !== 0) break; //to check string
        offset++;
        const key = readString();
        offset += key.bytesRead;
        // Read value
        const value = readString();
        offset += value.bytesRead;
        result[key.str] = { value: value.str, expiresAt: expiry };
      }
    } else {
      offset++;
    }
  }
  return result;
}
