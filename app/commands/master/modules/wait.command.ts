import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { REPLICA_CONNECTIONS, RelativeMasterOffset } from "../../../store/data";

export class WaitCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    if (args.length < 2) {
      connection.write(
        respEncoder(RESPSTATE.ERROR, [
          "ERR wrong number of arguments for 'wait' command",
        ])
      );
      return;
    }

    const numReplicas = parseInt(String(args[0]));
    const timeoutMs = parseInt(String(args[1]));

    if (
      isNaN(numReplicas) ||
      isNaN(timeoutMs) ||
      numReplicas < 0 ||
      timeoutMs < 0
    ) {
      connection.write(respEncoder(RESPSTATE.ERROR, ["ERR invalid arguments"]));
      return;
    }

    // If no replicas needed, respond immediately
    if (numReplicas === 0) {
      connection.write(respEncoder(RESPSTATE.INTEGER, ["0"]));
      return;
    }

    // If no replicas connected, respond immediately
    if (REPLICA_CONNECTIONS.size === 0) {
      connection.write(respEncoder(RESPSTATE.INTEGER, ["0"]));
      return;
    }

    const masterOffset = RelativeMasterOffset.get();
    const ackedReplicas = new Set<string>();
    let cleanupDone = false;

    // Cleanup function to avoid code duplication
    const cleanup = () => {
      if (cleanupDone) return;
      cleanupDone = true;
      clearInterval(sendGetAckInterval);
      clearInterval(checkAckInterval);
      clearTimeout(timeoutHandle);
    };

    // Send GETACK to all replicas periodically
    const sendGetAckInterval = setInterval(() => {
      const getAckCommand = respEncoder(RESPSTATE.ARRAY, [
        "REPLCONF",
        "GETACK",
        "*",
      ]);

      REPLICA_CONNECTIONS.forEach((socket) => {
        try {
          socket.connection.write(getAckCommand);
        } catch (err) {
          console.error("Error sending GETACK to replica:", err);
        }
      });
    }, 100);

    // Check for ACKs from replicas
    const checkAckInterval = setInterval(() => {
      REPLICA_CONNECTIONS.forEach((ackData, replicaId) => {
        const requiredOffset =
          masterOffset - (ackData.connectionTimeOffset || 0);

        if (ackData.offset >= requiredOffset) {
          ackedReplicas.add(replicaId);
        }
      });

      if (ackedReplicas.size >= numReplicas) {
        cleanup();
        connection.write(
          respEncoder(RESPSTATE.INTEGER, [String(ackedReplicas.size)])
        );
      }
    }, 20);

    // Timeout handler
    const timeoutHandle = setTimeout(() => {
      cleanup();
      connection.write(
        respEncoder(RESPSTATE.INTEGER, [String(ackedReplicas.size)])
      );
    }, timeoutMs);

    // Handle connection close
    connection.once("close", () => {
      cleanup();
    });
  }
}
