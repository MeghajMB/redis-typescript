import type net from "net";
import { RESPSTATE } from "../../../../enum/resp-state.enum";
import respEncoder from "../../../../util/resp-encoder";
import type { ICommand } from "../../../command.interface";
import { STREAM } from "../../../../store/data";

export class XReadCommand implements ICommand {
  async execute(args: string[], connection: net.Socket) {
    if (args.length < 3) {
      throw new Error(`wrong number of arguments for 'xread' command`);
    }
    let commandArguments: string[] = [];
    let finalStreams: any[] = [],
      response = respEncoder(RESPSTATE.NULL_BULK_STRING),
      timer = null;
    if (args[0] == "block") {
      timer = Number(args[1]);
      commandArguments = args.slice(3);
    } else {
      commandArguments = args.slice(1);
    }
    if (commandArguments.length % 2 !== 0)
      throw new Error(`wrong number of arguments for 'xread' command`);

    const initialStreamCount = this.getInitialStreamCount(commandArguments);

    if (timer !== null && timer >= 0) {
      await new Promise((resolve) => {
        let timeout: any;
        let interval = setInterval(() => {
          const stream = this.getStreams(commandArguments, initialStreamCount);
          if (stream.length > 0) {
            finalStreams = stream;
            response = respEncoder(RESPSTATE.ARRAY, finalStreams);
            clearInterval(interval);
            clearTimeout(timeout);
            resolve("");
          }
        }, 100);
        if (timer > 0) {
          timeout = setTimeout(() => {
            response = respEncoder(RESPSTATE.NULL_BULK_STRING);
            clearInterval(interval);
            clearTimeout(timeout);
            resolve("");
          }, timer);
        }
      });
    } else {
      finalStreams = this.getStreams(commandArguments, initialStreamCount);
      response = respEncoder(RESPSTATE.ARRAY, finalStreams);
    }
    connection.write(response);
  }
  getStreams(
    commandArguments: string[],
    initialStreamCount: { key: string; count: number }[] = []
  ) {
    let i = 0,
      j = commandArguments.length / 2,
      finalStreams = [];
    while (i < commandArguments.length / 2) {
      const key = commandArguments[i]!;
      const id = commandArguments[j]!.split("-").join("");
      const streams = STREAM.get(key);
      i++;
      j++;
      if (!streams) {
        continue;
      }
      if (id == "$") {
        const initialStream = initialStreamCount.find(
          (stream) => stream.key == key
        );

        if (
          !initialStream ||
          streams.length <= initialStream.count ||
          streams.length == 0
        ) {
          continue;
        }
        const latestStream = streams[streams.length - 1]!;
        let updatedStream: any[] = this.changeStreamResponse([latestStream]);
        finalStreams.push([key, updatedStream]);
        continue;
      }
      const filteredStreams = streams.filter((stream) => {
        const streamId = Number(stream.id!.split("-").join(""));
        return streamId > Number(id);
      });

      let updatedStream: any[] = this.changeStreamResponse(filteredStreams);
      if (updatedStream.length > 0) {
        finalStreams.push([key, updatedStream]);
      }
    }
    return finalStreams;
  }
  changeStreamResponse(filteredStreams: Record<string, string>[]) {
    let updatedStream: any[] = [];
    for (let i = 0; i < filteredStreams.length; i++) {
      let stream = [],
        id,
        currentStream = filteredStreams[i];
      for (let currKey in currentStream) {
        if (currKey == "id") {
          id = currentStream[currKey];
          continue;
        }
        stream.push(currKey, currentStream[currKey]);
      }
      updatedStream.push([id, stream]);
    }
    return updatedStream;
  }
  getInitialStreamCount(commandArguments: string[]) {
    let i = 0,
      j = commandArguments.length / 2,
      finalStreams = [];
    while (i < commandArguments.length / 2) {
      const key = commandArguments[i]!;
      const id = commandArguments[j]!.split("-").join("");
      const streams = STREAM.get(key);
      if (!streams || id !== "$") {
        i++;
        j++;
        continue;
      }
      finalStreams.push({ key, count: streams.length });

      i++;
      j++;
    }
    return finalStreams;
  }
}
