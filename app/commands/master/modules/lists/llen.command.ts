import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { LISTS } from "../../../../store/data";

export class LLenCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length !== 1) {
      throw new Error(`ERR wrong number of arguments for 'llen' command`);
    }
    const list = LISTS.get(args[0]!);
    let returnVal: number = 0;
    if (list) {
      returnVal = list.getSize();
    }
    const response = respEncoder(RESPSTATE.INTEGER, [String(returnVal)]);
    connection.write(response);
  }
}
