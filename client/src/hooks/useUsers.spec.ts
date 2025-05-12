import { renderHook, waitFor } from "@testing-library/react";
import { useUsers } from "./useUsers";
import axios from "axios";

describe("useUsers", () => {
  test("it should fetch users", async () => {
    const users = [{ name: "plop" }];
    axios.get = jest.fn(() => Promise.resolve({ data: users })) as any;
    const { result } = renderHook(() => useUsers());
    expect(result.current.isLoading).toEqual(true);
    await waitFor(() => expect(result.current.isLoading).toEqual(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.users).toEqual(users);
  });

  test("it should return error", async () => {
    axios.get = jest.fn(() => Promise.reject(new Error("error"))) as any;
    const { result } = renderHook(() => useUsers());
    expect(result.current.isLoading).toEqual(true);
    await waitFor(() => expect(result.current.isLoading).toEqual(false));
    expect(result.current.error).toEqual("error");
    expect(result.current.users).toEqual([]);
  });
});
