import type { ICommand } from "../../command.interface";
import { SetReplicaCommand } from "../modules/set.replica.command";
import { GetCommand } from "../modules/get.command";
import { DATA } from "../../../store/data";
import type { ICommandRegistry } from "./command-registry.interface";
import { InfoCommand } from "../modules/info.command";
import { ReplConfCommand } from "../modules/replconf.command";
import { PingCommand } from "../modules/ping.command";

export class SlaveCommandRegistry implements ICommandRegistry {
  private _commands: Map<string, ICommand> = new Map();

  constructor() {
    this.register("SET", new SetReplicaCommand(DATA));
    this.register("GET", new GetCommand());
    this.register("INFO", new InfoCommand());
    this.register("PING", new PingCommand());
    this.register("REPLCONF", new ReplConfCommand());
  }

  private register(commandName: string, command: ICommand): void {
    this._commands.set(commandName.toUpperCase(), command);
  }

  get(commandName: string): ICommand | undefined {
    return this._commands.get(commandName.toUpperCase());
  }
}
