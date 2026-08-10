import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Library, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { normalizeError, type ApiError } from "@/api/apiClient";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create account — Knowledge Repository" },
      {
        name: "description",
        content: "Register for access to the internal company knowledge repository.",
      },
      { property: "og:title", content: "Create account — Knowledge Repository" },
      {
        property: "og:description",
        content: "Request access to upload, search and manage company documents.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  function setField(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next["name"] = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next["email"] = "Enter a valid email address.";
    if (values.password.length < 6) next["password"] = "Use at least 6 characters.";
    if (values.password !== values.confirm) next["confirm"] = "Passwords do not match.";
    setLocalErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(values.name.trim(), values.email.trim(), values.password);
      toast.success("Account created", { description: "You can now sign in." });
      navigate({ to: "/login", replace: true });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const errorFor = (key: string) => localErrors[key] ?? error?.fieldErrors[key];

  return (
    <div className="auth-backdrop flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-elevated">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Library className="size-5" />
          </span>
          <span className="font-semibold">Knowledge Repository</span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register with your work email to access company documents.
        </p>

        {error && Object.keys(error.fieldErrors).length === 0 ? (
          <Alert variant="destructive" className="mt-5">
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Alex Morgan"
              autoComplete="name"
            />
            {errorFor("name") ? (
              <p className="text-sm text-destructive">{errorFor("name")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errorFor("email") ? (
              <p className="text-sm text-destructive">{errorFor("email")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(event) => setField("password", event.target.value)}
              autoComplete="new-password"
            />
            {errorFor("password") ? (
              <p className="text-sm text-destructive">{errorFor("password")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={values.confirm}
              onChange={(event) => setField("confirm", event.target.value)}
              autoComplete="new-password"
            />
            {errorFor("confirm") ? (
              <p className="text-sm text-destructive">{errorFor("confirm")}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
