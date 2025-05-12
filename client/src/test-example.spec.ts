import axios from "axios";
import { axiosExample, filterUsers, myFunctionToTest } from "./test-example";

jest.mock("axios");

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

  /*test("Test with mock", () => {
    const mock = jest.fn(() => true);
    const users = filterUsers(mock);
    expect(users.length).toEqual(2);
    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, { name: "John", age: 30 });
  });*/

  /*test("Text axios", async () => {
    const result = await axiosExample();
    expect(result).toEqual(1);
  });*/

  test("Text axis with mock", async () => {
    const posts = [
      { id: 1, userId: 2 },
      { id: 2, userId: 3 },
    ];
    const mock = (axios.get = jest.fn(() =>
      Promise.resolve({ data: posts })
    ) as any);
    const result = await axiosExample();
    expect(mock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(2);
  });
});
