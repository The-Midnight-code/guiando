"use client";

import TourActions from "./TourActions";
import DeleteTourButton from "./DeleteTourButton";

interface Tour {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  duration: number | null;
  price: string | null;
  active: boolean;
  tourType: {
    name: string;
  } | null;
  tourClass: {
    name: string;
  } | null;
}

interface ToursTableProps {
  tours: Tour[];
}

export default function ToursTable({ tours }: ToursTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      {tours.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          No tours found.
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full">
              <thead className="border-b bg-card-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Product ID
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tour
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Class
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Duration
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Price
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {tours.map((tour) => (
                  <tr
                    key={tour.id}
                    className="transition-colors hover:bg-card-secondary"
                  >
                    <td className="px-4 py-4 text-sm">
                      {tour.productId ?? "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">{tour.name}</div>

                      {tour.description && (
                        <div className="mt-1 max-w-xs truncate text-sm text-muted-foreground">
                          {tour.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {tour.tourType?.name ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {tour.tourClass?.name ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {tour.duration != null ? `${tour.duration} min` : "—"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {tour.price != null ? `$${tour.price}` : "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          tour.active
                            ? "bg-green-500/15 text-success"
                            : "bg-card-secondary text-muted-foreground"
                        }`}
                      >
                        {tour.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <TourActions id={tour.id} />

                        <DeleteTourButton id={tour.id} name={tour.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet */}
          <div className="divide-y lg:hidden">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="space-y-5 p-5 transition-colors hover:bg-card-secondary"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-medium">{tour.name}</h2>

                    {tour.description && (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {tour.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      tour.active
                        ? "bg-green-500/15 text-success"
                        : "bg-card-secondary text-muted-foreground"
                    }`}
                  >
                    {tour.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Product ID
                    </p>

                    <p className="mt-1">{tour.productId ?? "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Type
                    </p>

                    <p className="mt-1">{tour.tourType?.name ?? "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Class
                    </p>

                    <p className="mt-1">{tour.tourClass?.name ?? "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Duration
                    </p>

                    <p className="mt-1">
                      {tour.duration != null ? `${tour.duration} min` : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Price
                    </p>

                    <p className="mt-1">
                      {tour.price != null ? `$${tour.price}` : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <TourActions id={tour.id} />

                  <DeleteTourButton id={tour.id} name={tour.name} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
