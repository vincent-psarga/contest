export function globMatch(path: string, globs: string[]): boolean {
  return !!globs.find((glob) => {
    const globToRE = glob.replace(/\*\*\//g, ".+").replace(/\*/g, "[^\/]+");
    return new RegExp(`^${globToRE}$`).test(path);
  });
}
