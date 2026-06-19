import type { ILogger, ITypo } from "../../domain/services/ILogger";

class Typo implements ITypo {
  constructor(
    private readonly isTTY: boolean,
    private readonly output = console,
  ) {}

  success(msg: string) {
    return this.withStyle("[32m", msg);
  }

  warning(msg: string) {
    return this.withStyle("[32m", msg);
  }

  error(msg: string) {
    return this.withStyle("[31m", msg);
  }

  faded(msg: string) {
    return this.withStyle("[90m", msg);
  }

  important(msg: string) {
    return this.withStyle("[1m", msg);
  }

  private withStyle(modifier: string, msg: string) {
    if (!this.isTTY) return msg;

    return `\x1b${modifier}${msg}\x1b[0m`;
  }
}

export class ConsoleLogger implements ILogger {
  public readonly typo: ITypo;

  constructor(
    private readonly isTTY: boolean,
    private readonly output = console,
    private readonly stdout = process.stdout,
    private readonly stderr = process.stderr,
  ) {
    this.typo = new Typo(isTTY, output);
  }

  debug(...args: any[]): void {
    this.output.debug(...args);
  }

  error(...args: any[]): void {
    this.output.error(...args);
  }

  log(...args: any[]): void {
    this.output.log(...args);
  }

  write(msg: string, channel?: "stdout" | "stderr"): void {
    const pipe = channel === "stderr" ? this.stderr : this.stdout;
    pipe.write(msg);
  }
}
