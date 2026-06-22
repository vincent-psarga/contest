import { describe } from "./describe";
import { it } from "./it";
import { jestExpect as expect } from "@jest/expect";
import { beforeEach } from "./beforeEach";
import { SharedExamples } from "../models/SharedExamples";
import { itBehavesLike } from "./itBehavesLike";

type IArrayLike<T> = {
  [index: number]: T | undefined;
  push(o: T): void;
  length: number;
};

class SampleArray<T> implements IArrayLike<T> {
  private readonly _data: T[] = [];
  private _length: number = 0;
  [index: number]: T;

  constructor(...items: T[]) {
    for (let i = 0; i < items.length; i++) {
      this[i] = items[i]!;
      this._length++;
    }
  }

  push(o: T): void {
    this[this._length] = o;
    this._length++;
  }

  get length() {
    return this._length;
  }
}

const anArray = new SharedExamples<{
  makeSut: (...items: number[]) => IArrayLike<number>;
}>("an array", (context) => {
  it("is empty if not initialized", () => {
    const emptyArray = context.get("makeSut")();
    expect(emptyArray.length).toEqual(0);
  });

  it("can be initialized with values", () => {
    const populatedArray = context.get("makeSut")(1, 2, 3);
    expect(populatedArray.length).toEqual(3);
  });

  describe("#push", () => {
    let array: IArrayLike<number>;

    beforeEach(() => {
      array = context.get("makeSut")();
      array.push(1);
    });

    it("appends items at the end of the list", () => {
      expect(array[0]).toEqual(1);
    });

    it("updates the length", () => {
      expect(array.length).toEqual(1);
    });
  });
});

describe("sharedExamples", () => {
  describe("Array", () => {
    itBehavesLike(anArray, {
      makeSut: (...items) => {
        return [...items];
      },
    });
  });

  describe("SampleArray", () => {
    itBehavesLike(anArray, {
      makeSut: (...items) => {
        return new SampleArray(...items);
      },
    });
  });
});
