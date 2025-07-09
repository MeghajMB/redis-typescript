import { RESPSTATE } from "../enum/resp-state.enum";
import type { RESPStateType } from "../types/types";

export default function respEncoder(
  state: RESPStateType,
  data: string = ""
): string {
  switch (state) {
    case RESPSTATE.STRING:
      return `+${data}\r\n`;

    case RESPSTATE.ERROR:
      return `-Error ${data}\r\n`;

    case RESPSTATE.INTEGER:
      return `:${data}\r\n`;

    case RESPSTATE.BULK_STRING:
      return `$${data.length}\r\n${data}\r\n`;

    case RESPSTATE.NULL_BULK_STRING:
      return `$-1\r\n`;

    case RESPSTATE.SUCCESS:
      return `+OK\r\n`;

    default:
      return `-ERR Unknown RESP type\r\n`;
  }
}
