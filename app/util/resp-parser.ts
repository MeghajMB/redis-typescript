export class RespParser {
  static parse(input: string): { command: string; args: string[] } {
    const lines = input.split("\r\n").filter((line) => line !== "");

    if (lines.length === 0 || !lines[0].startsWith("*")) {
      throw new Error("Invalid RESP format");
    }

    const args: string[] = [];
    for (let i = 1; i < lines.length; i += 2) {
      if (lines[i].startsWith("$")) {
        args.push(lines[i + 1]);
      }
    }

    if (args.length === 0) {
      throw new Error("No command provided");
    }

    return {
      command: args[0].toUpperCase(),
      args: args.slice(1),
    };
  }
}
