import type { ICommand } from "../../command.interface";

export interface ICommandRegistry {
  get(commandName: string): ICommand | undefined;
}
