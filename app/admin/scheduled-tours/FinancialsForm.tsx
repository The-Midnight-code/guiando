"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createTourFinancialsAction,
  updateTourFinancialsAction,
} from "./financial-actions";

interface FinancialsFormProps {
  externalId: number;
  numberOfPeople: number;
  initialData?: {
    totalPaymentUsd?: string | null;
    guideCostMxn?: string | null;
    transportationCostMxn?: string | null;
    travelersCostMxn?: string | null;
    totalTravelersCostMxn?: string | null;
    extraExpensesMxn?: string | null;
    totalCostMxn?: string | null;
    totalCostUsd?: string | null;
    totalRevenueUsd?: string | null;
    revenuePercentage?: string | null;
    exchangeRate?: string | null;
  } | null;
}

export default function FinancialsForm({
  externalId,
  initialData,
  numberOfPeople,
}: FinancialsFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    totalPaymentUsd: initialData?.totalPaymentUsd ?? "",
    guideCostMxn: initialData?.guideCostMxn ?? "",
    transportationCostMxn: initialData?.transportationCostMxn ?? "",
    travelersCostMxn: initialData?.travelersCostMxn ?? "",
    totalTravelersCostMxn: initialData?.totalTravelersCostMxn ?? "",
    extraExpensesMxn: initialData?.extraExpensesMxn ?? "",
    totalCostMxn: initialData?.totalCostMxn ?? "",
    totalCostUsd: initialData?.totalCostUsd ?? "",
    totalRevenueUsd: initialData?.totalRevenueUsd ?? "",
    revenuePercentage: initialData?.revenuePercentage ?? "",
    exchangeRate: initialData?.exchangeRate ?? "",
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

  const totalPaymentUsd = Number(formData.totalPaymentUsd) || 0;

  const exchangeRate = Number(formData.exchangeRate) || 0;

  const guideCostMxn = Number(formData.guideCostMxn) || 0;

  const transportationCostMxn = Number(formData.transportationCostMxn) || 0;

  const extraExpensesMxn = Number(formData.extraExpensesMxn) || 0;

  const totalTravelersCostMxn =
    (Number(formData.travelersCostMxn) || 0) * numberOfPeople;

  const totalCostMxn =
    guideCostMxn +
    transportationCostMxn +
    totalTravelersCostMxn +
    extraExpensesMxn;

  const totalCostUsd = exchangeRate > 0 ? totalCostMxn / exchangeRate : 0;

  const totalRevenueUsd = totalPaymentUsd - totalCostUsd;

  const revenuePercentage =
    totalPaymentUsd > 0 ? (totalRevenueUsd / totalPaymentUsd) * 100 : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const input = {
        totalPaymentUsd: formData.totalPaymentUsd || undefined,

        exchangeRate: formData.exchangeRate || undefined,

        guideCostMxn: formData.guideCostMxn || undefined,

        transportationCostMxn: formData.transportationCostMxn || undefined,

        travelersCostMxn: formData.travelersCostMxn || undefined,

        totalTravelersCostMxn: totalTravelersCostMxn.toFixed(2),

        extraExpensesMxn: formData.extraExpensesMxn || undefined,

        totalCostMxn: totalCostMxn.toFixed(2),

        totalCostUsd: totalCostUsd.toFixed(2),

        totalRevenueUsd: totalRevenueUsd.toFixed(2),

        revenuePercentage: revenuePercentage.toFixed(2),
      };

      const result = initialData
        ? await updateTourFinancialsAction(externalId, input)
        : await createTourFinancialsAction(externalId, input);

      if (!result.success) {
        setError(result.error ?? "Failed to save financials.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
      name: "totalPaymentUsd",
      label: "Total Payment (USD)",
      calculated: false,
    },
    {
      name: "exchangeRate",
      label: "Exchange Rate (MXN/USD)",
      calculated: false,
    },
    {
      name: "guideCostMxn",
      label: "Guide Cost (MXN)",
      calculated: false,
    },
    {
      name: "transportationCostMxn",
      label: "Transportation Cost (MXN)",
      calculated: false,
    },
    {
      name: "travelersCostMxn",
      label: "Traveler Cost (MXN)",
      calculated: false,
    },
    {
      name: "totalTravelersCostMxn",
      label: "Total Travelers Cost (MXN)",
      calculated: true,
    },
    {
      name: "extraExpensesMxn",
      label: "Extra Expenses (MXN)",
      calculated: false,
    },
    {
      name: "totalCostMxn",
      label: "Total Cost (MXN)",
      calculated: true,
    },
    {
      name: "totalCostUsd",
      label: "Total Cost (USD)",
      calculated: true,
    },
    {
      name: "totalRevenueUsd",
      label: "Total Revenue (USD)",
      calculated: true,
    },
    {
      name: "revenuePercentage",
      label: "Revenue Percentage (%)",
      calculated: true,
    },
  ] as const;

  const getFieldValue = (fieldName: (typeof fields)[number]["name"]) => {
    switch (fieldName) {
      case "totalTravelersCostMxn":
        return totalTravelersCostMxn.toFixed(2);

      case "totalCostMxn":
        return totalCostMxn.toFixed(2);

      case "totalCostUsd":
        return totalCostUsd.toFixed(2);

      case "totalRevenueUsd":
        return totalRevenueUsd.toFixed(2);

      case "revenuePercentage":
        return revenuePercentage.toFixed(2);

      default:
        return formData[fieldName];
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Financials</h2>
        <p className="text-xs text-gray-500">People: {numberOfPeople}</p>

        <p className="mt-1 text-sm text-gray-500">
          Manage the financial information for this scheduled tour.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                type="number"
                step="0.01"
                value={getFieldValue(field.name)}
                onChange={handleChange}
                readOnly={field.calculated}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
                ? "Update Financials"
                : "Create Financials"}
          </button>
        </div>
      </form>
    </section>
  );
}
