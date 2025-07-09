import { RESPSTATE } from "../../enum/resp-state.enum";
import { DATA } from "../../store/data";
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";


export class SetCommand implements ICommand {
  execute(args: string[]): string {
    if (args.length < 2) {
      return respEncoder(
        RESPSTATE.ERROR,
        "ERR wrong number of arguments for 'set' command"
      );
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

    DATA.set(key, { value, expiresAt });
    return respEncoder(RESPSTATE.SUCCESS);
  }
}
