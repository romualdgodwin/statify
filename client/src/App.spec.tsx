import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { App } from "./App";

describe("App", () => {
  test("it should render", () => {
    render(<App />);
  });
});
