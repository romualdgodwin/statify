import { render, screen } from "@testing-library/react";
import { Users } from "./Users";
import "@testing-library/jest-dom";

jest.mock("../hooks/useUsers", () => ({
  useUsers: jest.fn(() => ({
    isLoading: false,
    users: [
      { id: 1, login: "user1" },
      { id: 2, login: "user2" },
    ],
    error: null,
  })),
}));

describe("Users", () => {
  it("should render", () => {
    render(<Users />);
  });

  it("should show users", async () => {
    render(<Users />);
    const users = await screen.findByTestId("users");
    expect(users.children.length).toEqual(2);
    const user1 = await screen.findByTestId("user-1");
    expect(user1).toHaveTextContent("user1");
  });
});
