import { createFileRoute } from "@tanstack/solid-router";
import { LoginForm } from "../ui/login-form.tsx";

export const Route = createFileRoute("/auth/login")({
  component: ClientLogin,
});

function ClientLogin() {
  return <LoginForm destination="/auth" allowSignUp />;
}
