export interface ITypo {
  success(msg: string): string;
  warning(msg: string): string;
  error(msg: string): string;
  faded(msg: string): string;

  important(msg: string): string;
}

export interface ILogger {
  typo: ITypo;

  debug(...args: any[]): void;
  log(...args: any[]): void;
  error(...args: any[]): void;
  write(msg: string, channel?: "stdout" | "stderr"): void;
}
