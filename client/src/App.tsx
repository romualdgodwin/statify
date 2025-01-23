import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Plop } from "./pages/Plop";
import { Users } from "./pages/Users";
import { CreateUser } from "./pages/CreateUser";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plop" element={<Plop />} />
        <Route path="/users" element={<Users />} />
        <Route path="/createUser" element={<CreateUser />} />
      </Routes>
    </BrowserRouter>
  );
};
