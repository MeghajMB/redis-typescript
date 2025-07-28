import * as net from "net";
import { RespParser } from "./util/resp-parser";
import { CommandRegistry } from "./commands/master/registry/command-registry";
import { clients, CONFIG, DATA, INFO } from "./store/data";
import respEncoder from "./util/resp-encoder";
import { RESPSTATE } from "./enum/resp-state.enum";
import { SlaveCommandRegistry } from "./commands/slave/registry/command-registry";
import { SlaveReplicationHandler } from "./lib/slave-replication-handler";
import fs from "fs";
import path from "path";
import { rdbParser } from "./util/rdb-file-parser";

const args = process.argv.slice(2);

let port = 6379;
let masterHost, masterPort;
let role: "master" | "slave" = "master";
if (args[0] == "--port") {
  if (!isNaN(Number(args[1]))) {
    port = Number(args[1]);
  }
} else if (
  args[0] == "--dir" &&
  args[2] == "--dbfilename" &&
  args[1] &&
  args[3]
) {
  CONFIG.dir = args[1];
  CONFIG.dbfilename = args[3];
  const filePath = path.join(CONFIG.dir, CONFIG.dbfilename);
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath);
    const keyValues = rdbParser(file);
    for (let key in keyValues) {
      DATA.set(key, {
        value: keyValues[key]!.value,
        expiresAt: keyValues[key]!.expiresAt,
      });
    }
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
  clients.set(connection, {
    isInTransaction: false,
    queuedCommands: [],
  });

  connection.on("data", async (data: Buffer) => {
    try {
      const input = data.toString().trim();
      const client = clients.get(connection);
      const commands = RespParser.parse(input);
      for (let pipeline of commands) {
        if (
          client?.isInTransaction &&
          pipeline.command !== "EXEC" &&
          pipeline.command !== "DISCARD"
        ) {
          client.queuedCommands.push(pipeline);
          const response = respEncoder(RESPSTATE.STRING, ["QUEUED"]);
          connection.write(response);
          continue;
        }

        const handler = commandRegistry.get(pipeline.command);
        if (!handler) {
          throw new Error(`ERR unknown command '${pipeline.command}'`);
        }

        await handler.execute(pipeline.args, connection);
        const currOffset = Number(INFO.get("master_repl_offset") || 0);
        const length = Buffer.byteLength(
          respEncoder(RESPSTATE.ARRAY, [pipeline.command, ...pipeline.args]),
          "utf-8"
        );
        INFO.set("master_repl_offset", String(currOffset + length));
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
