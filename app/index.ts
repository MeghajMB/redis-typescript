import * as net from "net";
import { RespParser } from "./util/resp-parser";
import { CommandRegistry } from "./commands/master/registry/command-registry";
import { INFO } from "./store/data";
import respEncoder from "./util/resp-encoder";
import { RESPSTATE } from "./enum/resp-state.enum";
import { SlaveCommandRegistry } from "./commands/slave/registry/command-registry";
import { SlaveReplicationHandler } from "./lib/slave-replication-handler";

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
const commandRegistry = new CommandRegistry();
const slaveCommandRegistry = new SlaveCommandRegistry();
if (replicaIndex !== -1) {
  role = "slave";

  if (args[replicaIndex + 1]) {
    const [host, portStr] = args[replicaIndex + 1]!.split(" ");
    masterHost = host;
    masterPort = Number(portStr);
    if (!masterHost || isNaN(masterPort)) {
      console.error("Invalid --replicaof arguments");
      process.exit(1);
    }

    const replicationHandler = new SlaveReplicationHandler(
      masterHost,
      masterPort,
      port,
      slaveCommandRegistry
    );
    replicationHandler.start();
  }
}
INFO.set("role", role);

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    try {
      const input = data.toString().trim();
      const commands = RespParser.parse(input);
      for (let pipeline of commands) {
        console.log(pipeline);
        const handler = commandRegistry.get(pipeline.command);
        if (!handler) {
          throw new Error(`ERR unknown command '${pipeline.command}'`);
        }

        handler.execute(pipeline.args, connection);
      }
    } catch (error) {
      if (error instanceof Error)
        connection.write(respEncoder(RESPSTATE.ERROR, [error.message]));
    }
  });
});
//
server.listen(port, "127.0.0.1", () => {
  console.log("server listing on port ", port);
});
