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

  const inputClassName =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  const labelClassName =
    "mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-6 py-5">
        <h2 className="font-semibold">Tour Photos</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add and manage photos for this tour.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <form
          onSubmit={handleAdd}
          className="rounded-lg border bg-card-secondary p-5"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold">Add Photo</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add an image URL and optional metadata.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="photo-url" className={labelClassName}>
                Image URL
              </label>

              <input
                id="photo-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/image.jpg"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="photo-alt" className={labelClassName}>
                Alt Text
              </label>

              <input
                id="photo-alt"
                type="text"
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
                placeholder="Description of the image"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="photo-sort-order" className={labelClassName}>
                Sort Order
              </label>

              <input
                id="photo-sort-order"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {error && (
            <div
              className="mt-4 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mt-5 border-t pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "Adding..." : "Add Photo"}
            </button>
          </div>
        </form>

        {photos.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-8 text-center">
            <p className="text-sm font-medium">No photos added yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a photo using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {photos
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((photo) => (
                <div
                  key={photo.id}
                  className="flex flex-col gap-5 rounded-lg border p-4 transition-colors hover:bg-card-secondary md:flex-row"
                >
                  <div className="h-48 w-full shrink-0 overflow-hidden rounded-md bg-card-secondary md:h-32 md:w-48">
                    {/* External image URLs are entered by admins and may come from arbitrary domains. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.alt ?? "Tour photo"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {editingId === photo.id ? (
                    <form
                      onSubmit={handleUpdate}
                      className="min-w-0 flex-1 space-y-4"
                    >
                      <div>
                        <label
                          htmlFor={`edit-url-${photo.id}`}
                          className={labelClassName}
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
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`edit-alt-${photo.id}`}
                          className={labelClassName}
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
                          className={inputClassName}
                        />
                      </div>

                      <div className="max-w-xs">
                        <label
                          htmlFor={`edit-sort-order-${photo.id}`}
                          className={labelClassName}
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
                          className={inputClassName}
                        />
                      </div>

                      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {isSubmitting ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                          className="w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-card sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {photo.url}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {photo.alt || "No alt text"}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Order: {photo.sortOrder}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 border-t pt-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(photo)}
                          className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id)}
                          className="text-sm font-medium text-error transition-colors hover:text-error/80"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
