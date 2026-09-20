"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createPickupLocationAction,
  updatePickupLocationAction,
} from "./actions";

interface PickupLocationFormProps {
  initialData?: {
    id: string;
    name: string;
    address: string;
    instructions?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    active: boolean;
  } | null;
}

export default function PickupLocationForm({
  initialData,
}: PickupLocationFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    address: initialData?.address ?? "",
    instructions: initialData?.instructions ?? "",
    latitude: initialData?.latitude ?? "",
    longitude: initialData?.longitude ?? "",
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
    const address = formData.address.trim();

    if (!name) {
      setError("Name is required.");
      setIsSubmitting(false);
      return;
    }

    if (!address) {
      setError("Address is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const input = {
        name,
        address,
        instructions: formData.instructions.trim() || undefined,
        latitude: formData.latitude.trim() || undefined,
        longitude: formData.longitude.trim() || undefined,
        active: formData.active,
      };

      const result = initialData
        ? await updatePickupLocationAction(initialData.id, input)
        : await createPickupLocationAction(input);

      if (!result.success) {
        setError(result.error ?? "Failed to save pickup location.");
        return;
      }

      router.push("/admin/catalogs/pickup-locations");
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
          {initialData ? "Edit Pickup Location" : "Create Pickup Location"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {initialData
            ? "Update the pickup location information."
            : "Create a new predefined pickup location."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Tijuana Airport"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Address
            </label>

            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter the pickup address"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Instructions
          </label>

          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Instructions for guides or travelers..."
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="latitude"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Latitude
            </label>

            <input
              id="latitude"
              name="latitude"
              type="text"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 32.5411"
            />
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Longitude
            </label>

            <input
              id="longitude"
              name="longitude"
              type="text"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. -116.9700"
            />
          </div>
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
                ? "Update Pickup Location"
                : "Create Pickup Location"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/catalogs/pickup-locations")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
