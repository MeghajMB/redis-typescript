import { DATA, LISTS, STREAM } from "../store/data";

export function checkType(key: string) {
  let type,
    count = 0,
    error: boolean | string = false;
  if (DATA.has(key)) {
    type = "string";
    count++;
  }
  if (LISTS.has(key)) {
    type = "list";
    count++;
  }
  if (STREAM.has(key)) {
    type = "stream";
    count++;
  }
  if (count > 1)
    error = "WRONGTYPE Operation against a key holding the wrong kind of value";
  return { type, error };
}
