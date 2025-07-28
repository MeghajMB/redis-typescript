import type net from "net";
import { DATA } from "../../../../store/data";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";

export class IncrCommand implements ICommand {
  constructor(private setCommand: ICommand) {}
  async execute(args: string[], connection: net.Socket) {
    if (args.length < 1 || !args[0]) {
      throw new Error("wrong number of arguments for 'incr' command");
    }

    const key = args[0];
    const record = DATA.get(key);

    let response;
    if (!record) {
      this.setCommand.execute([key, "1"]);
      response = respEncoder(RESPSTATE.INTEGER, ["1"]);
    } else if (isNaN(Number(record.value))) {
      throw new Error("value is not an integer or out of range");
    } else {
      const newValue = String(Number(record.value) + 1);
      this.setCommand.execute([key, newValue]);
      response = respEncoder(RESPSTATE.INTEGER, [newValue]);
    }
    if (connection) connection.write(response);
    return response;
  }
}
