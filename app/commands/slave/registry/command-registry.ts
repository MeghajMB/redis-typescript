import type { ICommand } from "../../command.interface";
import { SetCommand } from "../modules/set.command";
import { GetCommand } from "../modules/get.command";
import { DATA, REPLICA_CONNECTIONS } from "../../../store/data";
import type { ICommandRegistry } from "./command-registry.interface";
import { InfoCommand } from "../modules/info.command";

export class SlaveCommandRegistry implements ICommandRegistry {
  private _commands: Map<string, ICommand> = new Map();

  constructor() {
    this.register("SET", new SetCommand(REPLICA_CONNECTIONS, DATA));
    this.register("GET", new GetCommand());
    this.register("INFO", new InfoCommand());
  }

  private register(commandName: string, command: ICommand): void {
    this._commands.set(commandName.toUpperCase(), command);
  }

  get(commandName: string): ICommand | undefined {
    return this._commands.get(commandName.toUpperCase());
  }
}
