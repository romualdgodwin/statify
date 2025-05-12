import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "./Header";

describe("Header", () => {
  test("it should render the title with h1", async () => {
    render(<Header title="plop" />);
    const title = await screen.findByTestId("title");
    expect(title).toHaveTextContent("plop");
    expect(title.tagName).toEqual("H1");
  });
});
