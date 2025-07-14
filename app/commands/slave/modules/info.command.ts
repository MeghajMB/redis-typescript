import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import { INFO } from "../../../store/data";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";

export class InfoCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    let info = "";
    if (args[0]?.toLowerCase() == "replication") {
      const role = INFO.get("role");
      info = `role:${role}\r\n`;
      if (role == "master") {
        const master_repl_id = INFO.get("master_replid");
        const master_repl_offset = INFO.get("master_repl_offset");
        info += `master_repl_offset:${master_repl_offset}\r\nmaster_replid:${master_repl_id}`;
      }
    }
    const response = respEncoder(RESPSTATE.BULK_STRING, [info]);
  }
}
