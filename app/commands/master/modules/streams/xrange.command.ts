import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { STREAM } from "../../../../store/data";

export class XRangeCommand implements ICommand {
  execute(args: string[], connection: net.Socket) {
    if (args.length < 3) {
      throw new Error(`ERR wrong number of arguments for 'xrange' command`);
    }
    const streams = STREAM.get(args[0]);
    const start = Number(args[1].split("-").join(""));
    const end = args[2] == "+" ? Infinity : Number(args[2].split("-").join(""));
    if (!streams) {
      const response = respEncoder(RESPSTATE.ARRAY);
      connection.write(response);
      return;
    }
    const filteredStreams = streams.filter((stream) => {
      const streamId = Number(stream.id.split("-").join(""));
      return streamId >= start && streamId <= end;
    });
    let finalStreams: any[] = [];
    for (let i = 0; i < filteredStreams.length; i++) {
      let stream = [],
        id,
        currentStream = filteredStreams[i];
      for (let key in currentStream) {
        if (key == "id") {
          id = currentStream[key];
          continue;
        }
        stream.push(key, currentStream[key]);
      }
      finalStreams.push([id, stream]);
    }
    const response = respEncoder(RESPSTATE.ARRAY, finalStreams);
    connection.write(response);
  }
}
