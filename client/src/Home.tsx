import { useState } from "react";
import "./Home.css";
import { Page } from "./Page";

export const Home = () => {
  const [count, setCount] = useState(0);

  return (
    <Page title="Home">
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </Page>
  );
};
