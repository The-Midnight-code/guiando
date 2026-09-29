"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTourTypeAction, updateTourTypeAction } from "./actions";

interface TourTypeFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    active: boolean;
  } | null;
}

export default function TourTypeForm({ initialData }: TourTypeFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    active: initialData?.active ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      active: event.target.checked,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const name = formData.name.trim();

    if (!name) {
      setError("Name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const input = {
        name,
        description: formData.description.trim() || undefined,
        active: formData.active,
      };

      const result = initialData
        ? await updateTourTypeAction(initialData.id, input)
        : await createTourTypeAction(input);

      if (!result.success) {
        setError(result.error ?? "Failed to save tour type.");
        return;
      }

      router.push("/admin/catalogs/tour-types");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  const labelClassName =
    "mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-6 py-5">
        <h1 className="font-semibold">
          {initialData ? "Edit Tour Type" : "Create Tour Type"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {initialData
            ? "Update the tour type information."
            : "Create a new tour type."}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={labelClassName}>
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Private"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClassName}>
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe this tour type..."
              className={inputClassName}
            />
          </div>

          <div className="rounded-md border bg-card-secondary px-4 py-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleActiveChange}
                className="h-4 w-4 rounded border"
              />

              <span className="text-sm font-medium">Active</span>
            </label>

            <p className="mt-1 pl-7 text-xs text-muted-foreground">
              Active tour types are available when creating tours.
            </p>
          </div>

          {error && (
            <div
              className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push("/admin/catalogs/tour-types")}
              disabled={isSubmitting}
              className="w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-card-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Update Tour Type"
                  : "Create Tour Type"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
