import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { DATA } from "../../../store/data";

export class KeyCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    let response: string = respEncoder(RESPSTATE.NULL_BULK_STRING);
    if (args[0]!.toUpperCase() == "*") {
      const keys = [...DATA.keys()];
      console.log(keys);
      response = respEncoder(RESPSTATE.ARRAY, keys);
      connection.write(response);
    }
  }
}
