import { RESPSTATE } from "../../enum/resp-state.enum";
import { INFO } from "../../store/data";
import respEncoder from "../../util/resp-encoder";
import type { ICommand } from "../command.interface";

export class PsyncCommand implements ICommand {
  execute(args: string[]): string {
    const master_repl_id = INFO.get("master_replid");
    const master_repl_offset = INFO.get("master_repl_offset");
    return respEncoder(RESPSTATE.STRING, [
      `FULLRESYNC ${master_repl_id} ${master_repl_offset}`,
    ]);
  }
}
