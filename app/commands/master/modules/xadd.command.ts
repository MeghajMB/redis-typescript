import type net from "net";
import { RESPSTATE } from "../../../enum/resp-state.enum";
import respEncoder from "../../../util/resp-encoder";
import type { ICommand } from "../../command.interface";
import { STREAM } from "../../../store/data";

export class XAddCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length < 3 || args.length % 2 !== 0) {
      throw new Error(`ERR wrong number of arguments for 'xadd' command`);
    }
    const key = args[0];
    let id = args[1];
    const [millisec, seq] = id.split("-");

    if (id !== "*" && millisec == "0" && seq == "0") {
      throw new Error("The ID specified in XADD must be greater than 0-0");
    }
    let keyValues: Record<string, string> = {};
    for (let i = 2; i < args.length; i += 2) {
      keyValues[args[i]] = args[i + 1];
    }

    let stream = STREAM.get(key) || [];

    if (id === "*") {
      id = `${Date.now()}-0`;
    } else if (seq == "*") {
      const entriesWithSameTime = stream.filter((entry) => {
        const [entryMs] = entry.id.split("-");
        return entryMs === millisec;
      });

      if (entriesWithSameTime.length > 0) {
        const lastEntry = entriesWithSameTime[entriesWithSameTime.length - 1];
        const [_, lastSeq] = lastEntry.id.split("-").map(Number);
        id = `${millisec}-${lastSeq + 1}`;
      } else {
        id = millisec === "0" ? "0-1" : `${millisec}-0`;
      }
    } else {
      const lastEntry = stream[stream.length - 1];
      if (lastEntry) {
        const [lastMs, lastSeq] = lastEntry.id.split("-").map(Number);
        if (
          Number(millisec) < lastMs ||
          (Number(millisec) === lastMs && Number(seq) <= lastSeq)
        ) {
          throw new Error(
            "The ID specified in XADD is equal or smaller than the target stream top item"
          );
        }
      }
    }

    stream.push({ id, ...keyValues });
    STREAM.set(key, stream);

    const response = respEncoder(RESPSTATE.BULK_STRING, [id]);
    connection.write(response);
  }
}
