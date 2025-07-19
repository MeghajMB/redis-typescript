import type { ICommand } from "../../command.interface";
import { EchoCommand } from "../modules/echo.command";
import { SetCommand } from "../modules/set.command";
import { GetCommand } from "../modules/get.command";
import { PingCommand } from "../modules/ping.command";
import { DATA, REPLICA_CONNECTIONS } from "../../../store/data";
import type { ICommandRegistry } from "./command-registry.interface";
import { InfoCommand } from "../modules/info.command";
import { ReplConfCommand } from "../modules/replconf.command";
import { PsyncCommand } from "../modules/psync.command";
import { WaitCommand } from "../modules/wait.command";
import { ConfigCommand } from "../modules/config.command";
import { KeyCommand } from "../modules/key.command";

export class CommandRegistry implements ICommandRegistry {
  private _commands: Map<string, ICommand> = new Map();

  constructor() {
    this.register("PING", new PingCommand());
    this.register("ECHO", new EchoCommand());
    this.register("SET", new SetCommand(REPLICA_CONNECTIONS, DATA));
    this.register("GET", new GetCommand());
    this.register("INFO", new InfoCommand());
    this.register("REPLCONF", new ReplConfCommand());
    this.register("PSYNC", new PsyncCommand());
    this.register("WAIT", new WaitCommand());
    this.register("CONFIG", new ConfigCommand());
    this.register("KEYS", new KeyCommand());
  }

  private register(commandName: string, command: ICommand): void {
    this._commands.set(commandName.toUpperCase(), command);
  }

  get(commandName: string): ICommand | undefined {
    return this._commands.get(commandName.toUpperCase());
  }
}
