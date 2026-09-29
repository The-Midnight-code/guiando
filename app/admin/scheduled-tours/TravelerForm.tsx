"use client";

import { useState } from "react";

import { createTravelerAction, updateTravelerAction } from "./traveler-actions";

interface TravelerFormProps {
  initialData?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  onSuccess: (traveler: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  }) => void;
  onCancel: () => void;
}

export default function TravelerForm({
  initialData,
  onSuccess,
  onCancel,
}: TravelerFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const firstName = formData.firstName.trim();

    if (!firstName) {
      setError("First name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const input = {
        firstName,
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      };

      const result = initialData
        ? await updateTravelerAction(initialData.id, input)
        : await createTravelerAction(input);

      if (!result.success || !result.data) {
        setError(result.error ?? "Failed to save traveler.");
        return;
      }

      onSuccess({
        id: result.data.id,
        firstName: result.data.firstName,
        lastName: result.data.lastName ?? null,
        email: result.data.email ?? null,
        phone: result.data.phone ?? null,
      });
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card-secondary p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">
          {initialData ? "Edit Traveler" : "Add Traveler"}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {initialData
            ? "Update the traveler information below."
            : "Enter the traveler information below."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              First Name
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              placeholder="John"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Last Name
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Phone
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              placeholder="+1 555-123-4567"
            />
          </div>
        </div>

        {error && (
          <div
            className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
                ? "Update Traveler"
                : "Add Traveler"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
