import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { CONFIG } from "../../../store/data";

export class ConfigCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    let response: string = respEncoder(RESPSTATE.NULL_BULK_STRING);
    if (args[0]!.toUpperCase() == "GET") {
      if (args[1] == "dir") {
        response = respEncoder(RESPSTATE.ARRAY, ["dir", CONFIG.dir]);
      } else if (args[1] == "dbfilename") {
        response = respEncoder(RESPSTATE.ARRAY, ["dir", CONFIG.dbfilename]);
      }
      connection.write(response);
    }
    return response;
  }
}
