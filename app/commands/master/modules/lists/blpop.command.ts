import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { LISTS } from "../../../../store/data";

export class BLPopCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    if (args.length < 2) {
      throw new Error(`ERR wrong number of arguments for 'blpop' command`);
    }
    const timeout = Number(args[args.length - 1]);
    if (isNaN(timeout)) throw new Error(`Invalid timeout for 'blpop' command`);
    const expiryTime = Date.now() + timeout * 1000;
    let wait = false;
    if (timeout == 0) wait = true;
    while (Date.now() < expiryTime || wait) {
      for (let i = 0; i < args.length - 1; i++) {
        const list = LISTS.get(args[i]!);
        if (!list) continue;
        if (list.getSize() > 0) {
          const returnValue = list.lPop();
          const response = respEncoder(RESPSTATE.ARRAY, [
            args[i]!,
            ...returnValue,
          ]);
          connection.write(response);
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const response = respEncoder(RESPSTATE.NULL_BULK_STRING);
    connection.write(response);
  }
}
