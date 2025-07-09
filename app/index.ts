import * as net from "net";
import { RespParser } from "./util/resp-parser";
import { CommandRegistry } from "./commands/registry/command-registry";
import { INFO } from "./store/data";

const args = process.argv.slice(2);

let port = 6379;
let role: "master" | "slave" = "master";
if (args[0] == "--port") {
  if (!isNaN(Number(args[1]))) {
    port = Number(args[1]);
  }
}
if (args.includes("--replicaof")) {
  role = "slave";
}
INFO.set("role", role);
const commandRegistry = new CommandRegistry();

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    try {
      const input = data.toString().trim();
      const { command, args } = RespParser.parse(input);

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
