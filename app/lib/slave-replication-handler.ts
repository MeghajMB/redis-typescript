import type { ICommandRegistry } from "../commands/master/registry/command-registry.interface";
import { RESPSTATE } from "../enum/resp-state.enum";
import { ReplicaOffset } from "../store/data";
import respEncoder from "../util/resp-encoder";
import { RespParser } from "../util/resp-parser";
import net from "net";

export class SlaveReplicationHandler {
  private rdbBuffer: Buffer = Buffer.alloc(0);
  private rdbLength: number | null = null;
  private fullResyncReceived = false;
  private handshakeStep = 1;

  constructor(
    private masterHost: string,
    private masterPort: number,
    private replicaPort: number,
    private slaveCommandRegistry: ICommandRegistry
  ) {}
  start() {
    const masterSocket = net.createConnection(
      { host: this.masterHost, port: this.masterPort },
      () => {
        this.sendPing(masterSocket);
      }
    );

    masterSocket.on("data", (data: Buffer) => {
      this.handleMasterData(masterSocket, data);
    });

    masterSocket.on("error", (err) => {
      console.error("Master connection error:", err);
    });
  }
  private sendPing(socket: net.Socket) {
    const pingCommand = respEncoder(RESPSTATE.ARRAY, ["PING"]);
    socket.write(pingCommand);
  }
  private sendReplConfPort(socket: net.Socket) {
    const replConfPortCommand = respEncoder(RESPSTATE.ARRAY, [
      "REPLCONF",
      "listening-port",
      String(this.replicaPort),
    ]);
    socket.write(replConfPortCommand);
  }
  private sendReplConfCapa(socket: net.Socket) {
    const replConfCapaCommand = respEncoder(RESPSTATE.ARRAY, [
      "REPLCONF",
      "capa",
      "psync2",
    ]);
    socket.write(replConfCapaCommand);
  }
  private sendPsync(socket: net.Socket) {
    const psyncCommand = respEncoder(RESPSTATE.ARRAY, ["PSYNC", "?", "-1"]);
    socket.write(psyncCommand);
  }
  private handleMasterData(socket: net.Socket, data: Buffer) {
    try {
      switch (this.handshakeStep) {
        case 1: // After PING
          this.handshakeStep++;
          this.sendReplConfPort(socket);
          break;

        case 2: // After REPLCONF listening-port
          this.handshakeStep++;
          this.sendReplConfCapa(socket);
          break;

        case 3: // After REPLCONF capa
          this.handshakeStep++;
          this.sendPsync(socket);
          break;

        case 4: // Waiting for FULLRESYNC and RDB
          this.handleRdbTransfer(socket, data);
          break;

        case 5: // Normal command replication
          this.handleReplicationCommands(socket, data);
          break;

        default:
          console.error("Unknown handshake step:", this.handshakeStep);
      }
    } catch (error) {
      console.error(
        "Replication error:",
        error instanceof Error ? error.message : error
      );
    }
  }
  private handleRdbTransfer(socket: net.Socket, data: Buffer) {
    this.rdbBuffer = Buffer.concat([this.rdbBuffer, data]);

    // Check for FULLRESYNC if not received yet
    if (!this.fullResyncReceived) {
      const fullResyncEnd = this.rdbBuffer.indexOf("\r\n");
      if (fullResyncEnd === -1) return; // Wait for more data

      const fullResyncLine = this.rdbBuffer
        .subarray(0, fullResyncEnd)
        .toString();
      if (!fullResyncLine.startsWith("+FULLRESYNC")) {
        throw new Error("Expected FULLRESYNC response");
      }

      this.fullResyncReceived = true;
      this.rdbBuffer = this.rdbBuffer.subarray(fullResyncEnd + 2);
    }

    // Check for RDB length if not received yet
    if (this.rdbLength === null) {
      const lengthHeaderEnd = this.rdbBuffer.indexOf("\r\n");
      if (lengthHeaderEnd === -1) return; // Wait for more data

      const lengthHeader = this.rdbBuffer
        .subarray(0, lengthHeaderEnd)
        .toString();
      if (!lengthHeader.startsWith("$")) {
        throw new Error("Expected RDB length header");
      }

      this.rdbLength = parseInt(lengthHeader.substring(1));
      if (isNaN(this.rdbLength)) {
        throw new Error("Invalid RDB length");
      }

      this.rdbBuffer = this.rdbBuffer.subarray(lengthHeaderEnd + 2);
    }

    // Check if we have complete RDB data
    if (this.rdbBuffer.length >= this.rdbLength) {
      const rdbFile = this.rdbBuffer.subarray(0, this.rdbLength);
      const remainingData = this.rdbBuffer.subarray(this.rdbLength);

      // Process any commands that came after RDB
      if (remainingData.length > 0) {
        this.handleReplicationCommands(socket, remainingData);
      }

      // Reset for normal replication
      this.rdbBuffer = Buffer.alloc(0);
      this.rdbLength = null;
      this.fullResyncReceived = false;
      this.handshakeStep++;
    }
  }
  private handleReplicationCommands(socket: net.Socket, data: Buffer) {
    try {
      const input = data.toString();

      const commands = RespParser.parse(input);

      for (const cmd of commands) {
        const handler = this.slaveCommandRegistry.get(cmd.command);
        if (!handler) {
          console.error(`Unknown command: ${cmd.command}`);
          continue;
        }
        const result = handler.execute(cmd.args, socket);
        if (typeof result === "string" || Buffer.isBuffer(result)) {
          throw new Error(
            `Replica command '${cmd.command}' returned a response`
          );
        }
        const currOffset = ReplicaOffset.get();
        const length = Buffer.byteLength(
          respEncoder(RESPSTATE.ARRAY, [cmd.command, ...cmd.args]),
          "utf-8"
        );
        ReplicaOffset.set(currOffset + length);
      }
    } catch (error) {
      console.error(
        "Command processing error:",
        error instanceof Error ? error.message : error
      );
    }
  }
}
