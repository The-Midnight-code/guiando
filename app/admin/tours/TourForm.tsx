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

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Tour" : "Create Tour"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {initialData ? "Update the tour information." : "Create a new tour."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="productId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Product ID
            </label>

            <input
              id="productId"
              name="productId"
              type="text"
              value={formData.productId}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="tourTypeId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Tour Type
            </label>

            <select
              id="tourTypeId"
              name="tourTypeId"
              value={formData.tourTypeId}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <label
              htmlFor="tourClassId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Tour Class
            </label>

            <select
              id="tourClassId"
              name="tourClassId"
              value={formData.tourClassId}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <label
              htmlFor="duration"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Duration (minutes)
            </label>

            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleActiveChange}
          />

          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
                ? "Update Tour"
                : "Create Tour"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/tours")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
