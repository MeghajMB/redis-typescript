import { RESPSTATE } from "../../enum/resp-state.enum";
import { INFO } from "../../store/data";
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";

export class InfoCommand implements ICommand {
  execute(args: string[]): string {
    let info = "";
    if (args[0].toLowerCase() == "replication") {
      const role = INFO.get("role");
      info = `role:${role}\r\n`;
      if (role == "master") {
        info +=
          "master_repl_offset:0\r\nmaster_replid:8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
      }
    }
    return respEncoder(RESPSTATE.BULK_STRING, [info]);
  }
}
