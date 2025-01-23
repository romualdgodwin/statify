import { Button, Form } from "react-bootstrap";
import { Page } from "../components/Page";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

type UserForm = {
  login: string;
  password: string;
  isAdmin: boolean;
};

export const CreateUser = () => {
  const { register, handleSubmit } = useForm<UserForm>();

  const navigate = useNavigate();

  const onSubmit = handleSubmit(async ({ isAdmin, login, password }) => {
    await axios.post("http://localhost:3000/users", {
      login,
      password,
      role: isAdmin ? "admin" : "user",
    });
    navigate("/users");
  });

  return (
    <Page title="Create User">
      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>Login</Form.Label>
          <Form.Control placeholder="Enter login" {...register("login")} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            {...register("password")}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check type="checkbox" label="Admin" {...register("isAdmin")} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Page>
  );
};
