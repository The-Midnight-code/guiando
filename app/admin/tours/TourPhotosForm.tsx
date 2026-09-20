"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createTourPhotoAction,
  updateTourPhotoAction,
  deleteTourPhotoAction,
} from "./photo-actions";

interface TourPhoto {
  id: string;
  tourId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface TourPhotosFormProps {
  tourId: string;
  initialPhotos: TourPhoto[];
}

export default function TourPhotosForm({
  tourId,
  initialPhotos,
}: TourPhotosFormProps) {
  const router = useRouter();

  const [photos, setPhotos] = useState<TourPhoto[]>(initialPhotos);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    url: "",
    alt: "",
    sortOrder: "0",
  });

  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (photo: TourPhoto) => {
    setEditingId(photo.id);

    setEditForm({
      url: photo.url,
      alt: photo.alt ?? "",
      sortOrder: photo.sortOrder.toString(),
    });

    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setEditForm({
      url: "",
      alt: "",
      sortOrder: "0",
    });

    setError(null);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingId) return;

    if (!editForm.url.trim()) {
      setError("Image URL is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateTourPhotoAction(editingId, {
        url: editForm.url.trim(),
        alt: editForm.alt.trim() || undefined,
        sortOrder: Number(editForm.sortOrder) || 0,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to update photo.");
        return;
      }

      if (result.data) {
        setPhotos((current) =>
          current
            .map((photo) => (photo.id === editingId ? result.data! : photo))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        );
      }

      handleCancelEdit();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!url.trim()) {
      setError("Image URL is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createTourPhotoAction({
        tourId,
        url: url.trim(),
        alt: alt.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to add photo.");
        return;
      }

      if (result.data) {
        setPhotos((current) =>
          [...current, result.data].sort((a, b) => a.sortOrder - b.sortOrder),
        );
      }

      setUrl("");
      setAlt("");
      setSortOrder("0");

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?",
    );

    if (!confirmed) return;

    try {
      const result = await deleteTourPhotoAction(id);

      if (!result.success) {
        window.alert(result.error ?? "Failed to delete photo.");
        return;
      }

      setPhotos((current) => current.filter((photo) => photo.id !== id));

      router.refresh();
    } catch (err) {
      console.error(err);
      window.alert("An unexpected error occurred.");
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tour Photos</h2>

        <p className="mt-1 text-sm text-gray-500">
          Add and manage photos for this tour.
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-8 space-y-4">
        <div>
          <label
            htmlFor="photo-url"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Image URL
          </label>

          <input
            id="photo-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="photo-alt"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Alt Text
          </label>

          <input
            id="photo-alt"
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Description of the image"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="photo-sort-order"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Sort Order
          </label>

          <input
            id="photo-sort-order"
            type="number"
            min="0"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Photo"}
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="text-sm text-gray-500">No photos added yet.</p>
      ) : (
        <div className="space-y-4">
          {photos
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((photo) => (
              <div
                key={photo.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center"
              >
                <div className="h-32 w-full overflow-hidden rounded-md bg-gray-100 md:w-48">
                  <img
                    src={photo.url}
                    alt={photo.alt ?? "Tour photo"}
                    className="h-full w-full object-cover"
                  />
                </div>

                {editingId === photo.id ? (
                  <form
                    onSubmit={handleUpdate}
                    className="min-w-0 flex-1 space-y-3"
                  >
                    <div>
                      <label
                        htmlFor={`edit-url-${photo.id}`}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Image URL
                      </label>

                      <input
                        id={`edit-url-${photo.id}`}
                        type="url"
                        value={editForm.url}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            url: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`edit-alt-${photo.id}`}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Alt Text
                      </label>

                      <input
                        id={`edit-alt-${photo.id}`}
                        type="text"
                        value={editForm.alt}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            alt: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="max-w-xs">
                      <label
                        htmlFor={`edit-sort-order-${photo.id}`}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Sort Order
                      </label>

                      <input
                        id={`edit-sort-order-${photo.id}`}
                        type="number"
                        min="0"
                        value={editForm.sortOrder}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            sortOrder: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {photo.url}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {photo.alt || "No alt text"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Order: {photo.sortOrder}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(photo)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
