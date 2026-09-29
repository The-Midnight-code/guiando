import {
  getAffiliates,
  getPaymentTypes,
  getPickupLocations,
  getTourClasses,
  getTourTypes,
} from "@/lib/queries/catalogs";
import Link from "next/link";

export default async function CatalogsPage() {
  const [tourTypes, tourClasses, pickupLocations, affiliates, paymentTypes] =
    await Promise.all([
      getTourTypes(),
      getTourClasses(),
      getPickupLocations(),
      getAffiliates(),
      getPaymentTypes(),
    ]);

  const catalogs = [
    {
      name: "Tour Types",
      description: "Manage the types of tours available.",
      count: tourTypes.length,
      href: "/admin/catalogs/tour-types",
    },
    {
      name: "Tour Classes",
      description: "Manage the available tour classes.",
      count: tourClasses.length,
      href: "/admin/catalogs/tour-classes",
    },
    {
      name: "Pickup Locations",
      description: "Manage predefined pickup locations.",
      count: pickupLocations.length,
      href: "/admin/catalogs/pickup-locations",
    },
    {
      name: "Affiliates",
      description: "Manage tour affiliates.",
      count: affiliates.length,
      href: "/admin/catalogs/affiliates",
    },
    {
      name: "Payment Types",
      description: "Manage available payment methods.",
      count: paymentTypes.length,
      href: "/admin/catalogs/payment-types",
    },
  ];

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Catalogs</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage the catalogs used throughout the system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalogs.map((catalog) => (
          <Link
            key={catalog.name}
            href={catalog.href}
            className="rounded-xl border bg-card p-5 transition-colors hover:bg-card-secondary"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{catalog.name}</h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {catalog.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-card-secondary px-2.5 py-1 text-xs font-medium">
                {catalog.count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
