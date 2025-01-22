import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./Home";
import { Plop } from "./Plop";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plop" element={<Plop />} />
      </Routes>
    </BrowserRouter>
  );
};
