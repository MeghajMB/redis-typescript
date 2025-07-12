import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";

export class EchoCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length < 1) {
      throw new Error(`ERR wrong number of arguments for 'echo' command`);
    }

    const response = respEncoder(RESPSTATE.BULK_STRING, [args[0] as string]);
    connection.write(response);
  }
}
