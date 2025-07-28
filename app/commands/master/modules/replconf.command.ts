import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { REPLICA_CONNECTIONS } from "../../../store/data";

export class ReplConfCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    if (args[0] == "ACK") {
      const socketKey = `${connection.remoteAddress}:${connection.remotePort}`;
      const offset = parseInt(String(args[1]), 10);
      if (!isNaN(offset)) {
        const connection = REPLICA_CONNECTIONS.get(socketKey);
        if (!connection) return;
        connection.offset = offset;
        REPLICA_CONNECTIONS.set(socketKey, connection);
      }
      return;
    }
    const response = respEncoder(RESPSTATE.STRING, ["OK"]);
    connection.write(response);
  }
}
