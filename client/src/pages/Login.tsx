import Joi from "joi";
import { Page } from "../components/Page";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { redirect } from "react-router-dom";

type FormData = {
  login: string;
  password: string;
};

const formValidation = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
});

export const Login = () => {
  const { setAuth } = useAuth();

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      login: "",
      password: "",
    },
    resolver: joiResolver(formValidation),
  });

  const onSubmit = handleSubmit(async ({ login, password }) => {
    const response = await axios.post("http://localhost:3000/auth/login", {
      login,
      password,
    });
    setAuth(response.data.id, response.data.token);
  });

  return (
    <Page title="Login">
      <form
        onSubmit={onSubmit}
        className="border-1 border-black rounded-xl p-4 gap-4 flex flex-col"
      >
        <label className="input">
          <input
            type="text"
            className="grow"
            placeholder="Login"
            {...register("login")}
          />
        </label>
        <label className="input">
          <input
            type="text"
            placeholder="Password"
            className="grow"
            {...register("password")}
          />
        </label>
        <input type="submit" value="Login" />
      </form>
    </Page>
  );
};
