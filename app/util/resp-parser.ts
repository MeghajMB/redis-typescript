export class RespParser {
  static parse(input: string): { command: string; args: string[] }[] {
    if (input.length === 0 || input[0] != "*") {
      throw new Error("Invalid RESP format");
    }
    const commands = input.split("*").filter((line) => line !== "");
    const final = [];
    for (let command of commands) {
      const lines = command.split("\r\n").filter((line) => line !== "");
      const args: string[] = [];
      for (let i = 1; i < lines.length; i += 2) {
        if (lines[i]!.startsWith("$")) {
          args.push(lines[i + 1]!);
        }
      }
      if (args.length === 0) {
        throw new Error("No command provided");
      }
      final.push({ command: args[0]!.toUpperCase(), args: args.slice(1) });
    }


    return final
  }
}
