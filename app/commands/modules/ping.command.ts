import { RESPSTATE } from "../../enum/resp-state.enum";
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";


export class PingCommand implements ICommand {
  execute(args: string[]): string {
    return respEncoder(RESPSTATE.STRING, "PONG");
  }
}
