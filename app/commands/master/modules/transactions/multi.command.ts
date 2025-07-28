import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { clients } from "../../../../store/data";

export class MultiCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    let response;
    const client = clients.get(connection);
    if (!client) throw new Error("client has not been initialized");
    client.isInTransaction = true;
    clients.set(connection, client);

    response = respEncoder(RESPSTATE.SUCCESS);
    connection.write(response);
    return response;
  }
}
