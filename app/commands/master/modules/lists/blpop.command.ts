import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { LISTS } from "../../../../store/data";

export class BLPopCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {

  }
}
