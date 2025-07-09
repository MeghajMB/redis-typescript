import { RESPSTATE } from "../../enum/resp-state.enum";
import { DATA } from "../../store/data";
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";

export class GetCommand implements ICommand {
  execute(args: string[]): string {
    if (args.length < 1) {
      return respEncoder(
        RESPSTATE.ERROR,
        "ERR wrong number of arguments for 'get' command"
      );
    }

    const key = args[0];
    const record = DATA.get(key);

    if (!record) {
      return respEncoder(RESPSTATE.NULL_BULK_STRING);
    }

    if (record.expiresAt !== null && Date.now() > record.expiresAt) {
      DATA.delete(key);
      return respEncoder(RESPSTATE.NULL_BULK_STRING);
    }

    return respEncoder(RESPSTATE.BULK_STRING, record.value);
  }
}
