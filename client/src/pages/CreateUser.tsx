import { Button, Form } from "react-bootstrap";
import { Page } from "../components/Page";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const CreateUser = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  return (
    <Page title="Create User">
      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          await axios.post("http://localhost:3000/users", {
            login,
            password,
            role: isAdmin ? "admin" : "user",
          });
          navigate("/users");
        }}
      >
        <Form.Group>
          <Form.Label>Login</Form.Label>
          <Form.Control
            placeholder="Enter login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <span>Value is {login}</span>
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="Admin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Page>
  );
};
