import { createFileRoute } from "@tanstack/solid-router";
import { LoginForm } from "../ui/login-form.tsx";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in · Morph Studio" }] }),
  component: StudioLogin,
});

function StudioLogin() {
  return <LoginForm destination="/auth" />;
}
