import { Button, Form } from "react-bootstrap"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useAuth } from "../contexts/AuthContext"; // <-- récupère le token

type UserForm = {
  email: string;
  password: string;
  isAdmin: boolean;
};

const userFormSchema = Joi.object<UserForm>({
  email: Joi.string().email({ tlds: false }).required().messages({
    "string.empty": "L'email est requis",
    "string.email": "Format d'email invalide",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Le mot de passe doit contenir au moins 6 caractères",
    "string.empty": "Le mot de passe est requis",
  }),
  isAdmin: Joi.boolean(),
});

export const CreateUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: joiResolver(userFormSchema),
  });

  const { token } = useAuth(); // <-- récupère le token depuis le contexte
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async ({ isAdmin, email, password }) => {
    console.log("✅ Formulaire soumis avec :", { email, password, isAdmin });
    console.log("🔑 Token actuel :", token);

    try {
      const res = await axios.post(
        "http://localhost:3000/users",
        {
          email, // ✅ backend attend "email"
          password,
          role: isAdmin ? "admin" : "user", // ✅ conversion bool -> string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // <-- envoie le token
          },
        }
      );

      console.log("🎉 Utilisateur créé :", res.data);
      alert("Utilisateur créé avec succès !");
      navigate("/users");
    } catch (err: any) {
      console.error("❌ Erreur lors de la création de l’utilisateur :", err.response || err);
      alert(
        "Création échouée : " +
          (err.response?.status === 401
            ? "Non autorisé (connecte-toi en admin)."
            : "Une erreur est survenue.")
      );
    }
  });

  return (
    <div className="container mt-5">
      <h1>Créer un utilisateur</h1>
      <Form onSubmit={onSubmit} className="w-50 mx-auto mt-4">
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control placeholder="Enter email" {...register("email")} />
          {errors.email && (
            <div className="text-danger">{errors.email.message}</div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <div className="text-danger">{errors.password.message}</div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check type="checkbox" label="Admin" {...register("isAdmin")} />
        </Form.Group>

        <Button variant="dark" type="submit" className="w-100">
          Créer l’utilisateur
        </Button>
      </Form>
    </div>
  );
};
