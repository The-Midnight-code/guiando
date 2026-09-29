"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTourAction, updateTourAction } from "./actions";

interface TourFormProps {
  tourTypes: {
    id: string;
    name: string;
  }[];

  tourClasses: {
    id: string;
    name: string;
  }[];

  initialData?: {
    id: string;
    productId?: string | null;
    name: string;
    description?: string | null;
    duration?: number | null;
    price?: string | null;
    tourTypeId: string;
    tourClassId?: string | null;
    active: boolean;
  } | null;
}

export default function TourForm({
  tourTypes,
  tourClasses,
  initialData,
}: TourFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    productId: initialData?.productId ?? "",
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    duration: initialData?.duration?.toString() ?? "",
    price: initialData?.price ?? "",
    tourTypeId: initialData?.tourTypeId ?? "",
    tourClassId: initialData?.tourClassId ?? "",
    active: initialData?.active ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({
      ...previous,
      active: event.target.checked,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    if (!formData.name.trim()) {
      setError("Tour name is required.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.tourTypeId) {
      setError("Tour type is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const input = {
        productId: formData.productId || undefined,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        price: formData.price || undefined,
        tourTypeId: formData.tourTypeId,
        tourClassId: formData.tourClassId || undefined,
        active: formData.active,
      };

      const result = initialData
        ? await updateTourAction(initialData.id, input)
        : await createTourAction(input);

      if (!result.success) {
        setError(result.error ?? "Failed to save tour.");
        return;
      }

      if (!initialData) {
        if (!result.data) {
          setError("Tour was created but no tour data was returned.");
          return;
        }

        router.push(`/admin/tours/${result.data.id}`);
        return;
      }

      router.push("/admin/tours");
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
          {initialData ? "Edit Tour" : "Create Tour"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {initialData ? "Update the tour information." : "Create a new tour."}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                placeholder="Tour name"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="productId" className={labelClassName}>
                Product ID
              </label>

              <input
                id="productId"
                name="productId"
                type="text"
                value={formData.productId}
                onChange={handleChange}
                placeholder="Product ID"
                className={inputClassName}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClassName}>
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the tour..."
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="tourTypeId" className={labelClassName}>
                Tour Type
              </label>

              <select
                id="tourTypeId"
                name="tourTypeId"
                value={formData.tourTypeId}
                onChange={handleChange}
                required
                className={inputClassName}
              >
                <option value="">Select tour type</option>

                {tourTypes.map((tourType) => (
                  <option key={tourType.id} value={tourType.id}>
                    {tourType.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tourClassId" className={labelClassName}>
                Tour Class
              </label>

              <select
                id="tourClassId"
                name="tourClassId"
                value={formData.tourClassId}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="">Select tour class</option>

                {tourClasses.map((tourClass) => (
                  <option key={tourClass.id} value={tourClass.id}>
                    {tourClass.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className={labelClassName}>
                Duration (minutes)
              </label>

              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                placeholder="60"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="price" className={labelClassName}>
                Price (USD)
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClassName}
              />
            </div>
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
              Active tours are available for scheduled tour creation.
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
              onClick={() => router.push("/admin/tours")}
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
                  ? "Update Tour"
                  : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
