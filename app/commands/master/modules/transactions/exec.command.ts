import type net from "net";
import { clients, DATA, INFO } from "../../../../store/data";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { CommandRegistry } from "../../registry/command-registry";

export class ExecCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    let response: string = respEncoder(RESPSTATE.NULL_BULK_STRING);
    const client = clients.get(connection);
    if (!client) throw new Error("client has not been initialized");
    if (!client.isInTransaction) throw new Error("EXEC without MULTI");
    if (client.queuedCommands.length == 0) {
      response = respEncoder(RESPSTATE.ARRAY);
    } else {
      let commands = client.queuedCommands;
      const commandRegistry = new CommandRegistry();
      let responses = [];
      for (let pipeline of commands) {
        const handler = commandRegistry.get(pipeline.command);
        if (!handler) {
          throw new Error(`ERR unknown command '${pipeline.command}'`);
        }
        let result: string | void | null = null;
        try {
          result = await handler.execute(pipeline.args);
        } catch (error) {
          if (error instanceof Error) {
            result = respEncoder(RESPSTATE.ERROR, [error.message]);
          }
        }
        if (result) responses.push(result);
        const currOffset = Number(INFO.get("master_repl_offset") || 0);
        const length = Buffer.byteLength(
          respEncoder(RESPSTATE.ARRAY, [pipeline.command, ...pipeline.args]),
          "utf-8"
        );
        INFO.set("master_repl_offset", String(currOffset + length));
      }
      response = `*${responses.length}\r\n${responses.join("")}`;
      client.queuedCommands = [];
    }
    client.isInTransaction = false;
    clients.set(connection, client);
    console.log(response);
    connection.write(response);
    return response;
  }
}
