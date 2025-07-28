import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import {
  INFO,
  RelativeMasterOffset,
  REPLICA_CONNECTIONS,
} from "../../../store/data";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import fs from "fs";
import path from "path";

export class PsyncCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    const master_repl_id = INFO.get("master_replid");
    const response = respEncoder(RESPSTATE.STRING, [
      `FULLRESYNC ${master_repl_id} 0`,
    ]);
    connection.write(response);
    if (args[0] == "?" && args[1] == "-1") {
      const filePath = path.join(__dirname, "../../../store/empty.rdb");
      const file = fs.readFileSync(filePath);
      const key = `${connection.remoteAddress ?? "unknown"}:${
        connection.remotePort ?? 0
      }`;
      REPLICA_CONNECTIONS.set(key, {
        connection: connection,
        offset: 0,
        connectionTimeOffset: Number(RelativeMasterOffset.get()),
      });
      connection.on("close", () => {
        REPLICA_CONNECTIONS.forEach((socketData, key: string) => {
          if (socketData.connection === connection)
            REPLICA_CONNECTIONS.delete(key);
        });
      });
      connection.write(`$${file.length}\r\n`);
      connection.write(file);
    }
    return response;
  }
}
