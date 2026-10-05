import { FormEvent, useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const formSchema = z.object({
  name: z.string(),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const isSignUp = mode === "sign-up";
  const submitLabel = isSignUp ? "Create account" : "Sign in";

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const { error } = isSignUp
        ? await authClient.signUp.email({
            name: value.name || value.email.split("@")[0],
            email: value.email,
            password: value.password,
          })
        : await authClient.signIn.email({ email: value.email, password: value.password });

      if (error) {
        toast.add({ title: "Couldn't sign you in", description: error.message, type: "error" });
        return;
      }

      // Re-run beforeLoad checks so protected routes see the new session.
      await router.invalidate();
      await navigate({ to: redirect ?? "/example/account" });
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void form.handleSubmit();
    },
    [form],
  );
  const toggleMode = useCallback(() => setMode(isSignUp ? "sign-in" : "sign-up"), [isSignUp]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
      <Card className="w-full sm:max-w-sm">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up with an email and password."
              : "Sign in with your email and password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" noValidate onSubmit={handleSubmit}>
            <FieldGroup>
              {isSignUp ? (
                <form.Field name="name">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        autoComplete="name"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Ada Lovelace"
                        value={field.state.value}
                      />
                    </Field>
                  )}
                </form.Field>
              ) : null}

              <form.Field name="email">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="email"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        type="password"
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button className="w-full" disabled={isSubmitting} form="login-form" type="submit">
                {isSubmitting ? "Working..." : submitLabel}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={toggleMode}
              type="button"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>
          <Link className="text-sm text-muted-foreground hover:underline" to="/">
            Back home
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
