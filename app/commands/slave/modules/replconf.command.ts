import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { ReplicaOffset } from "../../../store/data";

export class ReplConfCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    if (args[0] === "GETACK" && args[1] === "*") {
      const currOffset = ReplicaOffset.get();
      const response = respEncoder(RESPSTATE.ARRAY, [
        "REPLCONF",
        "ACK",
        String(currOffset),
      ]);
      connection.write(response);
      return;
    }

    const okResponse = respEncoder(RESPSTATE.STRING, ["OK"]);
    connection.write(okResponse);
  }
}
