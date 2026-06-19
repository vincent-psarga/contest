import { describe } from "../../application/dsl/describe";
import { it } from "../../application/dsl/it";
import { jestExpect as expect } from "@jest/expect";
import { beforeEach } from "../../application/dsl/beforeEach";
import {
  ArgsParser,
  ExtraPositionalValue,
  MissingOptionValue,
  UnknownFlagException,
} from "./ArgsParser";

type SampleArgs = {
  firstFlag: boolean;
  secondFlag: boolean;
  firstOption: string;
  secondOption: number;
  positional: string;
  positional2: string;
};

describe<{ args: string[] }>("ArgsParser", (context) => {
  let argsParser: ArgsParser<SampleArgs>;

  beforeEach(() => {
    argsParser = new ArgsParser();
  });

  context.when("args is empty", { args: [] }, () => {
    it("returns an empty object", () => {
      expect(argsParser.parse(context.get("args"))).toStrictEqual({});
    });
  });

  describe("when flags are registered", () => {
    beforeEach(() => {
      argsParser
        .addFlag("firstFlag", {})
        .addFlag("secondFlag", { short: "sf" });
    });

    context.when("args is empty", { args: [] }, () => {
      it("returns an object with all flags to false", () => {
        expect(argsParser.parse(context.get("args"))).toStrictEqual({
          firstFlag: false,
          secondFlag: false,
        });
      });
    });

    context.when("flags are provided", { args: ["--firstFlag", "-sf"] }, () => {
      it("returns an object with all flags to true", () => {
        expect(argsParser.parse(context.get("args"))).toStrictEqual({
          firstFlag: true,
          secondFlag: true,
        });
      });
    });

    context.when(
      "unknown flag is provided",
      { args: ["--not-a-known-flag"] },
      () => {
        it("throws an error", () => {
          expect(() => argsParser.parse(context.get("args"))).toThrow(
            new UnknownFlagException("--not-a-known-flag"),
          );
        });
      },
    );
  });

  describe("when options are registered", () => {
    beforeEach(() => {
      argsParser
        .addOption("firstOption", {
          short: "fo",
          default: "some-default-value",
        })
        .addOption("secondOption", { getValue: (v) => parseInt(v) });
    });

    context.when("args is empty", { args: [] }, () => {
      it("returns an object with default values set", () => {
        expect(argsParser.parse(context.get("args"))).toStrictEqual({
          firstOption: "some-default-value",
        });
      });
    });

    context.when(
      "using the = syntax",
      { args: ["--firstOption=whatever", "--secondOption", "=", "15"] },
      () => {
        it("returns an object with the expected values", () => {
          expect(argsParser.parse(context.get("args"))).toStrictEqual({
            firstOption: "whatever",
            secondOption: 15,
          });
        });

        context.when(
          "there is no value provided after the = sign (compact writing)",
          { args: ["--firstOption="] },
          () => {
            it("throws a MissingOptionValue exception", () => {
              expect(() => argsParser.parse(context.get("args"))).toThrow(
                new MissingOptionValue("--firstOption"),
              );
            });
          },
        );

        context.when(
          "there is no value provided after the = sign (using spaces",
          { args: ["--firstOption", "="] },
          () => {
            it("throws a MissingOptionValue exception", () => {
              expect(() => argsParser.parse(context.get("args"))).toThrow(
                new MissingOptionValue("--firstOption"),
              );
            });
          },
        );
      },
    );

    context.when(
      "using the space syntax",
      { args: ["-fo", "whatever", "--secondOption", "15"] },
      () => {
        it("returns an object with the expected values", () => {
          expect(argsParser.parse(context.get("args"))).toStrictEqual({
            firstOption: "whatever",
            secondOption: 15,
          });
        });
      },
    );
  });

  describe("when positionals are registered", () => {
    beforeEach(() => {
      argsParser
        .addPositional("positional", { default: "." })
        .addPositional("positional2", {});
    });

    context.when("args is empty", { args: [] }, () => {
      it("returns an object with the default values set", () => {
        expect(argsParser.parse(context.get("args"))).toStrictEqual({
          positional: ".",
        });
      });
    });

    context.when(
      "args is set with a single value",
      { args: ["path/to/file.whatever"] },
      () => {
        it("returns an object with the positional set", () => {
          expect(argsParser.parse(context.get("args"))).toStrictEqual({
            positional: "path/to/file.whatever",
          });
        });
      },
    );

    context.when(
      "args is set with a multiple values",
      { args: ["path/to/file.whatever", "another/path"] },
      () => {
        it("returns an object with the positional set", () => {
          expect(argsParser.parse(context.get("args"))).toStrictEqual({
            positional: "path/to/file.whatever",
            positional2: "another/path",
          });
        });
      },
    );

    context.when(
      "args is set with a more values than expected",
      { args: ["path/to/file.whatever", "another/path", "and a third one"] },
      () => {
        it("throw a ExtraPositionalValue", () => {
          expect(() => argsParser.parse(context.get("args"))).toThrow(
            new ExtraPositionalValue("and a third one"),
          );
        });
      },
    );
  });
});
