import * as net from "net";
import { RespParser } from "./util/resp-parser";
import { CommandRegistry } from "./commands/registry/command-registry";
import { INFO } from "./store/data";
import respEncoder from "./util/resp-encoder";
import { RESPSTATE } from "./enum/resp-state.enum";

const args = process.argv.slice(2);

let port = 6379;
let masterHost, masterPort;
let role: "master" | "slave" = "master";
if (args[0] == "--port") {
  if (!isNaN(Number(args[1]))) {
    port = Number(args[1]);
  }
}
const replicaIndex = args.indexOf("--replicaof");
if (replicaIndex !== -1) {
  role = "slave";

  if (args[replicaIndex + 1]) {
    const [host, portStr] = args[replicaIndex + 1]!.split(" ");
    masterHost = host;
    masterPort = Number(portStr);
    if (!host || isNaN(masterPort)) {
      console.error("Invalid --replicaof arguments");
      process.exit(1);
    }
    const masterSocket = net.createConnection(
      { host: masterHost, port: masterPort },
      () => {
        const pingCommand = respEncoder(RESPSTATE.ARRAY, ["PING"]);
        masterSocket.write(pingCommand);
        let handshakeStep = 1;
        masterSocket.on("data", (data: Buffer) => {
          const response = data.toString();
          if (handshakeStep == 1) {
            const replConfPortCommand = respEncoder(RESPSTATE.ARRAY, [
              "REPLCONF",
              "listening-port",
              String(port),
            ]);
            masterSocket.write(replConfPortCommand);
            handshakeStep++;
          } else if (handshakeStep == 2) {
            const replConfCapaCommand = respEncoder(RESPSTATE.ARRAY, [
              "REPLCONF",
              "capa",
              "psync2",
            ]);
            masterSocket.write(replConfCapaCommand);
            handshakeStep++;
          } else if (handshakeStep == 3) {
            const psyncCommand = respEncoder(RESPSTATE.ARRAY, [
              "PSYNC",
              "?",
              "-1",
            ]);
            masterSocket.write(psyncCommand);
            handshakeStep++;
          }
        });
      }
    );
  }
}
INFO.set("role", role);
const commandRegistry = new CommandRegistry();

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    try {
      const input = data.toString().trim();
      const { command, args } = RespParser.parse(input);
      console.log(command, args);
      const handler = commandRegistry.get(command);
      if (!handler) {
        throw new Error(`ERR unknown command '${command}'`);
      }

      const response = handler.execute(args);
      connection.write(response);
    } catch (error) {
      if (error instanceof Error) connection.write(`-${error.message}\r\n`);
    }
  });
});
//
server.listen(port, "127.0.0.1", () => {
  console.log("server listing on port ", port);
});
