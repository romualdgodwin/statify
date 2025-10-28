import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../services/api"; // ✅ on utilise l’axios centralisé

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

  const navigate = useNavigate();

  const onSubmit = handleSubmit(async ({ isAdmin, email, password }) => {
    try {
      const res = await api.post("/users", {
        email,
        password,
        role: isAdmin ? "admin" : "user",
      });

      console.log("🎉 Utilisateur créé :", res.data);
      alert("Utilisateur créé avec succès !");
      navigate("/users");
    } catch (err: any) {
      console.error("❌ Erreur création :", err.response || err);
      alert(
        "Création échouée : " +
          (err.response?.status === 401
            ? "Non autorisé (connecte-toi en admin)."
            : "Une erreur est survenue.")
      );
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "80vh",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <h1 className="text-center mb-4">Créer un utilisateur</h1>
        <Form onSubmit={onSubmit}>
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
    </div>
  );
};
