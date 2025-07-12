import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { INFO } from "../../../store/data";

export class SetCommand implements ICommand {
  private _connectionStore;
  private _dataStore;
  constructor(
    replicaConnections: Map<string, net.Socket>,
    dataStore: Map<
      string,
      {
        value: string;
        expiresAt: null | number;
      }
    >
  ) {
    this._connectionStore = replicaConnections;
    this._dataStore = dataStore;
  }
  execute(args: string[], connection: net.Socket) {
    if (args.length < 2) {
      throw new Error("ERR wrong number of arguments for 'set' command");
    }

    const key = args[0] as string,
      value = args[1] as string;
    let expiresAt: number | null = null;
    if (INFO.get("role") == "master") {
      this._connectionStore.forEach((socket, key) => {
        socket.write(respEncoder(RESPSTATE.ARRAY, ["SET", ...args]));
      });
    }

    if (args.length > 3 && args[2]?.toUpperCase() === "PX") {
      const ttl = parseInt(args[3] as string);
      if (!isNaN(ttl)) {
        expiresAt = Date.now() + ttl;
      }
    }

    this._dataStore.set(key, { value, expiresAt });
    const response = respEncoder(RESPSTATE.SUCCESS);
    connection.write(response);
  }
}
