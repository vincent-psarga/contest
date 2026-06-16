export class UnknownFlagException extends Error {
    constructor(flag: string) {
        super(`Unknown flag: ${flag}`)
    }
}

export class MissingOptionValue extends Error {
    constructor(option: string) {
        super(`Missing value for option: ${option}`)
    }
}

export class ExtraPositionalValue extends Error {
    constructor(value: string) {
        super(`Unable to assign "${value}" to any positional`)
    }
}

export type CliArg<T> = {
    short?: string,
    description?: string,
    getValue?: (arg: string) => T,
    default?: T
}
export type Flag = Omit<CliArg<boolean>, 'getValue' | 'default'>
export type Positional<T> = Omit<CliArg<T>, 'short'>

export class ArgsParser<T> {
    private readonly flags: Partial<Record<keyof T, CliArg<boolean>>> = {}
    private readonly options: Partial<Record<keyof T, CliArg<unknown>>> = {}
    private readonly positionals: Partial<Record<keyof T, CliArg<unknown>>> = {}

    private flattenedFlags: Record<string, string>;
    private flattenedOptions: Record<string, string>;

    addFlag<K extends keyof T>(name: K, flag: Flag): ArgsParser<T> {
        this.flags[name] = {...flag, default: false};
        return this;
    }

    addOption<K extends keyof T>(name: K, option: CliArg<T[K]>): ArgsParser<T> {
        this.options[name] = option
        return this;
    }

    addPositional<K extends keyof T>(name: K, positional: Positional<T[K]>): ArgsParser<T> {
        this.positionals[name] = positional;
        return this;
    }

    parse(args: string[]): T {
        const parsed = this.buildDefaultValue();
        const argsCopy = args.map((arg) => arg);

        let currentPositionalIndex = 0;

        while (argsCopy.length > 0) {
            const arg = argsCopy.shift();
            // Not really necessary as we're not supposed to arrive here.
            if (!arg) break;

            if (arg?.startsWith('-')) {
                const flagKey = this.getFlagKey(arg);
                if (flagKey) {
                    parsed[flagKey] = true;
                    continue;
                }

                const {optionKey, optionValue} = this.getOptionKey(arg);
                if (optionKey) {
                    if (optionValue) {
                        parsed[optionKey] = optionValue;
                        continue
                    }

                    const value = argsCopy.shift();
                    if (!value) {
                        throw new UnknownFlagException(arg);
                    }

                    if (value === '=') {
                        const actualValue = argsCopy.shift();
                        if (!actualValue) {
                            throw new MissingOptionValue(`--${String(optionKey)}`);
                        }
                        parsed[optionKey] = this.getOptionValue(optionKey, actualValue);
                        continue;
                    }

                    parsed[optionKey] = this.getOptionValue(optionKey, value);
                    continue
                }

                throw new UnknownFlagException(arg);
            }

            const positionalKey = Object.keys(this.positionals)[currentPositionalIndex] as keyof T;
            if (!positionalKey) {
                throw new ExtraPositionalValue(arg)
            }
            ;

            parsed[positionalKey] = this.getPositionalValue(positionalKey, arg);
            currentPositionalIndex++
        }

        return parsed;
    }

    private getFlagKey(arg: string): keyof T | null {
        this.flattenedFlags ??= Object.entries(this.flags).reduce((acc, [key, value]) => {
            acc[`--${key}`] = key;
            if (value.short) {
                acc[`-${value.short}`] = key;
            }

            return acc;
        }, {} as Record<string, string>);

        if (this.flattenedFlags[arg]) {
            return this.flattenedFlags[arg] as keyof T
        }
        return null;
    }

    private getOptionKey<K extends keyof T>(arg: string): { optionKey: K | null, optionValue?: T[K] } {
        this.flattenedOptions ??= Object.entries(this.options).reduce((acc, [key, value]) => {
            acc[`--${key}`] = key;
            if (value.short) {
                acc[`-${value.short}`] = key;
            }

            return acc;
        }, {} as Record<string, string>);

        if (arg.includes('=')) {
            const [key, value] = arg.split('=');
            if (!value) {
                throw new MissingOptionValue(key);
            }


            const optionKey = this.flattenedOptions[key] as K;
            if (optionKey) {
                return {
                    optionKey,
                    optionValue: this.getOptionValue(optionKey, value),
                }
            }
        }

        const optionKey = this.flattenedOptions[arg] as K;
        if (optionKey) {
            return {optionKey};
        }

        return {optionKey: null}
    }

    private getOptionValue<K extends keyof T>(key: K, value: string): T[K] {
        return this.getValue(this.options[key] as CliArg<T[K]>, value);
    }

    private getPositionalValue<K extends keyof T>(key: K, value: string): T[K] {
        return this.getValue(this.positionals[key] as CliArg<T[K]>, value);
    }

    private getValue<K extends keyof T>(option: CliArg<T[K]>, value: string): T[K] {
        if (option.getValue) {
            return option.getValue(value);
        }
        return value as T[K];
    }

    private buildDefaultValue(): T {
        const defaultValues = {} as T;
        for (const flag of Object.keys(this.flags)) {
            defaultValues[flag] = false;
        }

        for (const [name, option] of Object.entries(this.options)) {
            if (option.default) {
                defaultValues[name] = option.default;
            }
        }

        for (const [name, positional] of Object.entries(this.positionals)) {
            if (positional.default) {
                defaultValues[name] = positional.default;
            }
        }

        return defaultValues;
    }
}
