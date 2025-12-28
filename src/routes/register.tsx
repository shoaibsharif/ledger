import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkUserExists, register } from "@/server/functions/auth";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    const { exists } = await checkUserExists();
    if (exists) {
      throw redirect({ to: "/login" });
    }
  },
  component: Register,
});

function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        setError(null);

        if (value.password !== value.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        await register({ data: { email: value.email, password: value.password } });
        router.invalidate();
        await router.navigate({ to: "/" });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Registration failed");
        }
      }
    },
  });

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription className="text-zinc-400">
            Set up your account to start tracking expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <form.Field
                name="email"
                children={(field) => (
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <form.Field
                name="password"
                children={(field) => (
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                )}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
