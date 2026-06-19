export class UnknownFlagException extends Error {
  constructor(flag: string) {
    super(`Unknown flag: ${flag}`);
  }
}

export class MissingOptionValue extends Error {
  constructor(option: string) {
    super(`Missing value for option: ${option}`);
  }
}

export class ExtraPositionalValue extends Error {
  constructor(value: string) {
    super(`Unable to assign "${value}" to any positional`);
  }
}

export type CliArg<T> = {
  short?: string;
  description?: string;
  getValue?: (arg: string) => T;
  default?: T;
};
export type Flag = Omit<CliArg<boolean>, "getValue" | "default">;
export type Positional<T> = Omit<CliArg<T>, "short">;

export class ArgsParser<T> {
  private readonly flags: Partial<Record<keyof T, CliArg<boolean>>> = {};
  private readonly options: Partial<Record<keyof T, CliArg<unknown>>> = {};
  private readonly positionals: Partial<Record<keyof T, CliArg<unknown>>> = {};

  private flattenedFlags: Record<string, string> | null = null;
  private flattenedOptions: Record<string, string> | null = null;

  addFlag<K extends keyof T>(name: K, flag: Flag): this {
    this.flags[name] = { ...flag, default: false };
    return this;
  }

  addOption<K extends keyof T>(name: K, option: CliArg<T[K]>): this {
    this.options[name] = option;
    return this;
  }

  addPositional<K extends keyof T>(
    name: K,
    positional: Positional<T[K]>,
  ): this {
    this.positionals[name] = positional;
    return this;
  }

  parse(args: string[]): T {
    const argsCopy = args.map((arg) => arg);

    const flags: Partial<Record<keyof T, boolean>> = {};
    const options: Partial<Record<keyof T, unknown>> = {};
    const positionals: Partial<Record<keyof T, unknown>> = {};

    let currentPositionalIndex = 0;

    while (argsCopy.length > 0) {
      const arg = argsCopy.shift();
      // Not really necessary as we're not supposed to arrive here.
      if (!arg) break;

      if (arg?.startsWith("-")) {
        const flagKey = this.getFlagKey(arg);
        if (flagKey) {
          flags[flagKey] = true;
          continue;
        }

        const { optionKey, optionValue } = this.getOptionKey(arg);
        if (optionKey) {
          if (optionValue) {
            options[optionKey] = optionValue;
            continue;
          }

          const value = argsCopy.shift();
          if (!value) {
            throw new UnknownFlagException(arg);
          }

          if (value === "=") {
            const actualValue = argsCopy.shift();
            if (!actualValue) {
              throw new MissingOptionValue(`--${String(optionKey)}`);
            }
            options[optionKey] = this.getOptionValue(optionKey, actualValue);
            continue;
          }

          options[optionKey] = this.getOptionValue(optionKey, value);
          continue;
        }

        throw new UnknownFlagException(arg);
      }

      const positionalKey = Object.keys(this.positionals)[
        currentPositionalIndex
      ] as keyof T;
      if (!positionalKey) {
        throw new ExtraPositionalValue(arg);
      }
      positionals[positionalKey] = this.getPositionalValue(positionalKey, arg);
      currentPositionalIndex++;
    }

    return {
      ...this.buildDefaultValue(),
      ...flags,
      ...options,
      ...positionals,
    } as T;
  }

  private getFlagKey(arg: string): keyof T | null {
    return (this.computeFlattenedFlags()[arg] as keyof T) ?? null;
  }

  private computeFlattenedFlags() {
    this.flattenedFlags ??= Object.keys(this.flags).reduce(
      (acc, key) => {
        const value = this.flags[key as keyof T];
        acc[`--${key}`] = key;
        if (value?.short) {
          acc[`-${value.short}`] = key;
        }

        return acc;
      },
      {} as Record<string, string>,
    );
    return this.flattenedFlags;
  }

  private getOptionKey<K extends keyof T>(
    arg: string,
  ): { optionKey: K | null; optionValue?: T[K] } {
    this.flattenedOptions ??= Object.keys(this.options).reduce(
      (acc, key) => {
        const value = this.options[key as keyof T];
        acc[`--${key}`] = key;
        if (value?.short) {
          acc[`-${value.short}`] = key;
        }

        return acc;
      },
      {} as Record<string, string>,
    );

    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      if (!key || !value) {
        throw new MissingOptionValue(key ?? "unknownKey");
      }

      const optionKey = this.flattenedOptions[key] as K;
      if (optionKey) {
        return {
          optionKey,
          optionValue: this.getOptionValue(optionKey, value),
        };
      }
    }

    const optionKey = this.flattenedOptions[arg] as K;
    if (optionKey) {
      return { optionKey };
    }

    return { optionKey: null };
  }

  private getOptionValue<K extends keyof T>(key: K, value: string): T[K] {
    return this.getValue(this.options[key] as CliArg<T[K]>, value);
  }

  private getPositionalValue<K extends keyof T>(key: K, value: string): T[K] {
    return this.getValue(this.positionals[key] as CliArg<T[K]>, value);
  }

  private getValue<K extends keyof T>(
    option: CliArg<T[K]>,
    value: string,
  ): T[K] {
    if (option.getValue) {
      return option.getValue(value);
    }
    return value as T[K];
  }

  private buildDefaultValue(): T {
    const flags: Partial<Record<string, boolean>> = {};
    const options: Partial<Record<string, unknown>> = {};
    const positionals: Partial<Record<string, unknown>> = {};

    const defaultValues = {} as T;
    for (const flag of Object.keys(this.flags)) {
      flags[flag] = false;
    }

    for (const name of Object.keys(this.options)) {
      const option = this.options[name as keyof T];

      if (option?.default) {
        options[name] = option.default;
      }
    }

    for (const name of Object.keys(this.positionals)) {
      const positional = this.positionals[name as keyof T];
      if (positional?.default) {
        positionals[name] = positional.default;
      }
    }

    return {
      ...flags,
      ...options,
      ...positionals,
    } as T;
  }
}
