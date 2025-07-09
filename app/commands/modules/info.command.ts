import { RESPSTATE } from "../../enum/resp-state.enum";
import { INFO } from "../../store/data"; 
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";

export class InfoCommand implements ICommand {
  execute(args: string[]): string {
    let info = "";
    if (args[0]?.toLowerCase() == "replication") {
      const role = INFO.get("role");
      info = `role:${role}\r\n`;
    }
    return respEncoder(RESPSTATE.BULK_STRING, info);
  }
}
