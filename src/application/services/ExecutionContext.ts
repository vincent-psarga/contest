import { v4 as uuidv4 } from "uuid";
import { ContextSetInTestLoop } from "../../domain/errors/ContextSetInTestLoop";
import type { IStorage } from "../../domain/models/IStorage";

import { Storage } from "../utils/Storage";

export class ExecutionContext<T> implements IStorage<T> {
  public readonly id = uuidv4();
  private readonly contextStorage: Storage<T>;

  constructor(contextStorages: Storage<T>[]) {
    this.contextStorage = new Storage<T>();
    for (const storage of contextStorages) {
      for (const key of storage.keys) {
        this.contextStorage.set(key, () => storage.get(key));
      }
    }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.contextStorage.get(key);
  }

  set(): void {
    throw new ContextSetInTestLoop();
  }
}
