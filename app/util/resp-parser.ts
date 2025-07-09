export class RespParser {
  static parse(input: string): { command: string; args: string[] } {
    const lines = input.split("\r\n").filter((line) => line !== "");

    if (lines.length === 0 || !lines[0]?.startsWith("*")) {
      throw new Error("Invalid RESP format");
    }

    const args: string[] = [];
    for (let i = 1; i < lines.length; i += 2) {
      if (lines[i]?.startsWith("$")) {
        const nextLine = lines[i + 1];
        if (typeof nextLine === "string") {
          args.push(nextLine);
        } else {
          throw new Error("Incomplete bulk string");
        }
      }
    }

    if (args.length === 0) {
      throw new Error("No command provided");
    }

    return {
      command: args[0]?.toUpperCase() as string,
      args: args.slice(1),
    };
  }
}
