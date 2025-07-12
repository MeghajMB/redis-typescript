import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import { INFO, REPLICA_CONNECTIONS } from "../../../store/data";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import fs from "fs";
import path from "path";

export class PsyncCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {

    const master_repl_id = INFO.get("master_replid");
    const master_repl_offset = INFO.get("master_repl_offset");
    const response = respEncoder(RESPSTATE.STRING, [
      `FULLRESYNC ${master_repl_id} ${master_repl_offset}`,
    ]);
    connection.write(response);
    if (args[0] == "?" && args[1] == "-1") {
      const filePath = path.join(__dirname, "../../store/empty.rdb");
      const file = fs.readFileSync(filePath);
      connection.on("close", () => {
        REPLICA_CONNECTIONS.forEach((socket, key) => {
          if (socket === connection) REPLICA_CONNECTIONS.delete(key);
        });
      });
      const key = `${connection.remoteAddress ?? "unknown"}:${
        connection.remotePort ?? 0
      }`;
      REPLICA_CONNECTIONS.set(key, connection);
      connection.write(`$${file.length}\r\n`);
      connection.write(file);
    }
  }
}
