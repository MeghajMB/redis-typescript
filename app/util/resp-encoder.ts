import { RESPSTATE } from "../enum/resp-state.enum";
import type { RESPData, RESPStateType } from "../types/types";

export default function respEncoder(
  state: RESPStateType,
  data: RESPData = [""]
): string {
  switch (state) {
    case RESPSTATE.STRING:
      return `+${data[0]}\r\n`;

    case RESPSTATE.ERROR:
      return `-ERR ${data[0]}\r\n`;

    case RESPSTATE.INTEGER:
      return `:${data}\r\n`;

    case RESPSTATE.BULK_STRING:
      return `$${data[0]?.length}\r\n${data[0]}\r\n`;

    case RESPSTATE.ARRAY:
      let result = `*${data.length}\r\n`;
      for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i])) {
          result+=respEncoder(RESPSTATE.ARRAY, data[i]);
        } else {
          result += respEncoder(RESPSTATE.BULK_STRING, [data[i]]);
        }
      }
      return result;

    case RESPSTATE.NULL_BULK_STRING:
      return `$-1\r\n`;

    case RESPSTATE.SUCCESS:
      return `+OK\r\n`;

    default:
      return `-ERR Unknown RESP type\r\n`;
  }
}
