import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { clients } from "../../../../store/data";

export class DiscardCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    let response: string = respEncoder(RESPSTATE.NULL_BULK_STRING);
    const client = clients.get(connection);
    if (!client) throw new Error("No conection");
    if (client.isInTransaction) {
      client.queuedCommands = [];
      client.isInTransaction = false;
      clients.set(connection, client);
      response = respEncoder(RESPSTATE.SUCCESS);
    } else {
      throw new Error("DISCARD without MULTI");
    }
    connection.write(response);
    return response;
  }
}
