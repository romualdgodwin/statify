import { Button, Form } from "react-bootstrap";
import { Page } from "../components/Page";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

type UserForm = {
  login: string;
  password: string;
  isAdmin: boolean;
};

const userFormSchema = Joi.object<UserForm>({
  login: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const CreateUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: joiResolver(userFormSchema),
  });

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
          {errors.login && <span>{errors.login.message}</span>}
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && <span>{errors.password.message}</span>}
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
