import type net from "net";
import { DATA } from "../../../store/data";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";

export class GetCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length < 1 || !args[0]) {
      throw new Error("ERR wrong number of arguments for 'get' command");
    }

    const key = args[0];
    const record = DATA.get(key);

    let response;
    if (!record) {
      response = respEncoder(RESPSTATE.NULL_BULK_STRING);
    } else if (record.expiresAt !== null && Date.now() > record.expiresAt) {
      DATA.delete(key);
      response = respEncoder(RESPSTATE.NULL_BULK_STRING);
    } else {
      response = respEncoder(RESPSTATE.BULK_STRING, [record.value]);
    }

  }
}
