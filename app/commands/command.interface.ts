export interface ICommand {
  execute(args: string[]): string;
}