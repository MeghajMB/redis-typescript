import type { ICommand } from "../../command.interface";

export class SetReplicaCommand implements ICommand {
  private _dataStore;
  constructor(
    dataStore: Map<
      string,
      {
        value: string;
        expiresAt: null | number;
      }
    >
  ) {
    this._dataStore = dataStore;
  }
  execute(args: string[]) {
    if (args.length < 2) {
      throw new Error("ERR wrong number of arguments for 'set' command");
    }

    const key = args[0] as string,
      value = args[1] as string;
    let expiresAt: number | null = null;

    if (args.length > 3 && args[2]?.toUpperCase() === "PX") {
      const ttl = parseInt(args[3] as string);
      if (!isNaN(ttl)) {
        expiresAt = Date.now() + ttl;
      }
    }

    this._dataStore.set(key, { value, expiresAt });
  }
}
