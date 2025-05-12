import { filterUsers, myFunctionToTest } from "./test-example";

describe("Example test", () => {
  test("It returns a + b", () => {
    const result = myFunctionToTest(42, 23);
    expect(result).toEqual(65);
  });

  test("Filter users", () => {
    const users = filterUsers((user) => user.age > 25);

    expect(users.length).toEqual(1);
    expect(users[0].name).toEqual("John");
  });

  test("Test with mock", () => {
    const mock = jest.fn(() => true);
    const users = filterUsers(mock);
    expect(users.length).toEqual(2);
    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, { name: "John", age: 30 });
  });
});
