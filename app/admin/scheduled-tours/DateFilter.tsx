"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    onChange(`${year}-${month}-${day}`);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-md border px-4 py-2 text-sm outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
      >
        {value || "Select date"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border bg-white p-3 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
          />

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
