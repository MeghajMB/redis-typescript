import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { LISTS } from "../../../../store/data";

export class LRangeCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length !== 3) {
      throw new Error(`ERR wrong number of arguments for 'lrange' command`);
    }
    const list = LISTS.get(args[0]!);
    let returnVal: string[] = [];
    if (list) {
      returnVal = list.lrange(Number(args[1]), Number(args[2]));
    }
    const response = respEncoder(RESPSTATE.ARRAY, returnVal);
    connection.write(response);
  }
}
