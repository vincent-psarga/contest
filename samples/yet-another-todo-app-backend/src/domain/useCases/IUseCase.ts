export interface IUseCase<Command, Response extends Object> {
  execute: (command: Command) => Promise<Response>;
}
