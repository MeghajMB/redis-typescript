import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { LISTS } from "../../../../store/data";
import { Lists } from "../../../../store/list";

export class LPushCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length < 2) {
      throw new Error(`ERR wrong number of arguments for 'lpush' command`);
    }
    let existingList = LISTS.get(args[0]!);
    let returnVal: number = 0;
    const values = args.slice(1);
    if (existingList) {
      returnVal = existingList.lPush(values);
    } else {
      const list = new Lists();
      returnVal = list.lPush(values);
      LISTS.set(args[0]!, list);
    }
    const response = respEncoder(RESPSTATE.INTEGER, [String(returnVal)]);
    connection.write(response);
  }
}
