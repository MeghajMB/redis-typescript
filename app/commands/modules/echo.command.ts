
import { RESPSTATE } from "../../enum/resp-state.enum";
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";

export class EchoCommand implements ICommand {
  execute(args: string[]): string {
    if (args.length < 1) {
      return respEncoder(RESPSTATE.ERROR, ["ERR wrong number of arguments for 'echo' command"]);
    }
    return respEncoder(RESPSTATE.BULK_STRING, [args[0]]);
  }
}