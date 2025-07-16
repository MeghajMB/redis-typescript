export class RespParser {
  static parse(input: string): { command: string; args: string[] }[] {
    const commands: { command: string; args: string[] }[] = [];

    let i = 0;
    while (i < input.length) {
      if (input[i] !== "*") break;

      // Parse number of elements
      const lineEnd = input.indexOf("\r\n", i);
      const count = parseInt(input.slice(i + 1, lineEnd));
      i = lineEnd + 2;

      const parts: string[] = [];
      for (let j = 0; j < count; j++) {
        if (input[i] !== "$") throw new Error("Expected $");
        const lenEnd = input.indexOf("\r\n", i);
        const len = parseInt(input.slice(i + 1, lenEnd));
        i = lenEnd + 2;
        const val = input.slice(i, i + len);
        parts.push(val);
        i += len + 2; 
      }

      commands.push({
        command: parts[0]!.toUpperCase(),
        args: parts.slice(1),
      });
    }

    return commands;
  }
}
