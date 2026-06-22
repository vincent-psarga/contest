import type { IContext } from "../../domain/models/IContext";

export class SharedExamples<T> {
  constructor(
    private readonly _name: string,
    private readonly _examples: (context: IContext<T>) => void,
  ) {}

  get name() {
    return this._name;
  }

  get examples() {
    return this._examples;
  }
}
