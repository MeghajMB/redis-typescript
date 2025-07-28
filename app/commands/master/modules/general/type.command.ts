import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { checkType } from "../../../../util/check-type";

export class TypeCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    if (args.length < 1) {
      throw new Error(`ERR wrong number of arguments for 'type' command`);
    }
    const { type } = checkType(args[0]);
    let responseValue = "none";
    if (type) {
      responseValue = type;
    }
    const response = respEncoder(RESPSTATE.STRING, [responseValue]);
    connection.write(response);
  }
}
