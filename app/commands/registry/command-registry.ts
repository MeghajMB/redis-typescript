import type { ICommand } from "../command.interface";
import { EchoCommand } from "../echo.command";
import { SetCommand } from "../get.command";
import { PingCommand } from "../ping.command";
import { GetCommand } from "../set.command";
import type { ICommandRegistry } from "./command-registry.interface";

export class CommandRegistry implements ICommandRegistry {
  private _commands: Map<string, ICommand> = new Map();

  constructor() {
    this.register("PING", new PingCommand());
    this.register("ECHO", new EchoCommand());
    this.register("SET", new SetCommand());
    this.register("GET", new GetCommand());
  }

  private register(commandName: string, command: ICommand): void {
    this._commands.set(commandName.toUpperCase(), command);
  }

  get(commandName: string): ICommand | undefined {
    return this._commands.get(commandName.toUpperCase());
  }
}
