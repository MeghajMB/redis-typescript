import type { ICommand } from "../../command.interface";
import { EchoCommand } from "../modules/general/echo.command";
import { SetCommand } from "../modules/set.command";
import { GetCommand } from "../modules/get.command";
import { PingCommand } from "../modules/general/ping.command";
import { DATA, REPLICA_CONNECTIONS } from "../../../store/data";
import type { ICommandRegistry } from "./command-registry.interface";
import { InfoCommand } from "../modules/general/info.command";
import { ReplConfCommand } from "../modules/replconf.command";
import { PsyncCommand } from "../modules/psync.command";
import { WaitCommand } from "../modules/wait.command";
import { ConfigCommand } from "../modules/config.command";
import { KeyCommand } from "../modules/key.command";
import { RPushCommand } from "../modules/lists/rpush.command";
import { LPushCommand } from "../modules/lists/lpush.command";
import { LRangeCommand } from "../modules/lists/lrange.command";
import { LLenCommand } from "../modules/lists/llen.command";
import { LPopCommand } from "../modules/lists/lpop.command";
import { BLPopCommand } from "../modules/lists/blpop.command";
import { TypeCommand } from "../modules/general/type.command";
import { XAddCommand } from "../modules/streams/xadd.command";
import { XRangeCommand } from "../modules/streams/xrange.command";
import { XReadCommand } from "../modules/streams/xread.command";
import { IncrCommand } from "../modules/transactions/incr.command";
import { MultiCommand } from "../modules/transactions/multi.command";
import { ExecCommand } from "../modules/transactions/exec.command";
import { DiscardCommand } from "../modules/transactions/discard.command";

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
    /* List Commands */
    this.register("RPUSH", new RPushCommand());
    this.register("LPUSH", new LPushCommand());
    this.register("LRANGE", new LRangeCommand());
    this.register("LLEN", new LLenCommand());
    this.register("LPOP", new LPopCommand());
    this.register("BLPOP", new BLPopCommand());
    /* Stream Commands */
    this.register("TYPE", new TypeCommand());
    this.register("XADD", new XAddCommand());
    this.register("XRANGE", new XRangeCommand());
    this.register("XREAD", new XReadCommand());
    /* Transaction Commands */
    this.register(
      "INCR",
      new IncrCommand(new SetCommand(REPLICA_CONNECTIONS, DATA))
    );
    this.register("MULTI", new MultiCommand());
    this.register("EXEC", new ExecCommand());
    this.register("DISCARD", new DiscardCommand());
  }

  private register(commandName: string, command: ICommand): void {
    this._commands.set(commandName.toUpperCase(), command);
  }

  get(commandName: string): ICommand | undefined {
    return this._commands.get(commandName.toUpperCase());
  }
}
