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

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Tour Type" : "Create Tour Type"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {initialData
            ? "Update the tour type information."
            : "Create a new tour type."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Private"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe this tour type..."
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={handleActiveChange}
            className="h-4 w-4 rounded border-gray-300"
          />

          <span className="text-sm text-gray-700">Active</span>
        </label>

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
                ? "Update Tour Type"
                : "Create Tour Type"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/catalogs/tour-types")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
