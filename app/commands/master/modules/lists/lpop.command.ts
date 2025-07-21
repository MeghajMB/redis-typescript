import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { LISTS } from "../../../../store/data";

export class LPopCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (!args[0])
      throw new Error(`ERR wrong number of arguments for 'lpop' command`);
    const list = LISTS.get(args[0]);
    const count = args[1] || 1;
    let response: string = respEncoder(RESPSTATE.NULL_BULK_STRING);
    let returnValues: string[] = [];
    if (list) {
      returnValues = list.lPop(Number(count));

      if (returnValues.length !== 0 && !args[1]) {
        response = respEncoder(RESPSTATE.BULK_STRING, [returnValues[0]!]);
      }
      if (returnValues.length !== 0 && args[1]) {
        response = respEncoder(RESPSTATE.ARRAY, returnValues);
      }
    }
    connection.write(response);
  }
}
