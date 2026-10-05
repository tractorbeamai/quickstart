"use client";

import { FormEvent, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
});

export const Route = createFileRoute("/_app/example/form")({
  component: FormPage,
});

function FormPage() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      toast.add({
        title: "Bug report submitted",
        description: `${value.title} — ${value.description}`,
        type: "success",
      });
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void form.handleSubmit();
    },
    [form],
  );
  const handleReset = useCallback(() => form.reset(), [form]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Bug Report</CardTitle>
          <CardDescription>Help us improve by reporting bugs you encounter.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="bug-report-form" noValidate onSubmit={handleSubmit}>
            <FieldGroup>
              <form.Field name="title">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          field.handleChange(event.target.value);
                        }}
                        placeholder="Login button not working on mobile"
                        value={field.state.value}
                      />
                      <FieldDescription>
                        Provide a concise title for your bug report.
                      </FieldDescription>
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="description">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          aria-invalid={isInvalid}
                          className="min-h-24 resize-none"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            field.handleChange(event.target.value);
                          }}
                          placeholder="I'm having an issue with the login button on mobile."
                          rows={6}
                          value={field.state.value}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {field.state.value.length}/100 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>
                        Include steps to reproduce, expected behavior, and what actually happened.
                      </FieldDescription>
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button disabled={!canSubmit || isSubmitting} type="submit" form="bug-report-form">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              )}
            </form.Subscribe>
          </Field>
        </CardFooter>
      </Card>
    </main>
  );
}
