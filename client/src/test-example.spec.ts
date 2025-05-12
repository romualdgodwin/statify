import { myFunctionToTest } from "./test-example";

describe("Example test", () => {
  test("It returns a + b", () => {
    const result = myFunctionToTest(42, 23);
    expect(result).toEqual(65);
  });
});
