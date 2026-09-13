import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  loginCredentialsSchema,
  type LoginCredentials,
} from "@/features/auth/auth-api";
import { useAuth } from "@/features/auth/use-auth";

interface LoginLocationState {
  from?: string;
}

const Login = () => {
  const { signIn, status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (status === "authenticated") {
    return <Navigate to="/private" replace />;
  }

  const onSubmit = async (values: LoginCredentials) => {
    setSubmitError(null);

    try {
      await signIn(values);
      const state = location.state as LoginLocationState | null;
      await navigate(state?.from ?? "/private", { replace: true });
    } catch {
      setSubmitError(
        "Unable to sign in. Check your credentials and try again.",
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm items-center px-6">
      <section className="w-full space-y-6" aria-labelledby="login-title">
        <div className="space-y-2">
          <h1
            id="login-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Use the credentials provided by your API.
          </p>
        </div>

        <form
          noValidate
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {submitError ? (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || status === "loading"}
            >
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </section>
    </main>
  );
};

export default Login;
