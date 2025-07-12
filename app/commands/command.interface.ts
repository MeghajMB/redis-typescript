import type net from "net";
export interface ICommand {
  execute(args: string[], connection: net.Socket): void;
}
