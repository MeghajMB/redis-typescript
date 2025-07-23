import { RESPSTATE } from "../enum/resp-state.enum";
import type { RESPStateType } from "../types/types";

export default function respEncoder(
  state: RESPStateType,
  data: string[] = [""]
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
        result += `$${data[i]?.length}\r\n${data[i]}\r\n`;
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
