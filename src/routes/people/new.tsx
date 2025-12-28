import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPerson } from "@/server/functions/people";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/people/new")({
  component: AddPerson,
});

function AddPerson() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
    onSubmit: async ({ value }) => {
      await createPerson({ data: value });
      router.invalidate();
      await router.navigate({ to: "/people" });
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Person</h1>
        <Link to="/people" className={buttonVariants({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Contact information for the person.</CardDescription>
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
              <Label htmlFor="name">Name</Label>
              <form.Field
                name="name"
                validators={{
                  onChange: z.string().min(1, "Name is required"),
                }}
                children={(field) => (
                  <>
                    <Input
                      id="name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-zinc-700 bg-zinc-950"
                      placeholder="John Doe"
                    />
                    {field.state.meta.errors ? (
                      <em role="alert" className="text-red-500 text-xs">{field.state.meta.errors.join(", ")}</em>
                    ) : null}
                  </>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <form.Field
                  name="email"
                  children={(field) => (
                    <Input
                      id="email"
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-zinc-700 bg-zinc-950"
                      placeholder="john@example.com"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <form.Field
                  name="phone"
                  children={(field) => (
                    <Input
                      id="phone"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-zinc-700 bg-zinc-950"
                      placeholder="+1 555-1234"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <form.Field
                name="notes"
                children={(field) => (
                  <Textarea
                    id="notes"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-zinc-700 bg-zinc-950 resize-none h-24"
                    placeholder="Met at..."
                  />
                )}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={form.state.isSubmitting}>
                {form.state.isSubmitting ? "Saving..." : "Save Person"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
