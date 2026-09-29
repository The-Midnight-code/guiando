"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

function parseDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const dayPickerClassNames = {
  months: "flex flex-col",
  month: "space-y-4",
  month_caption: "flex items-center justify-center px-2",
  caption_label: "text-sm font-medium",
  nav: "flex items-center gap-1",
  button_previous:
    "absolute left-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-secondary hover:text-foreground",
  button_next:
    "absolute right-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-secondary hover:text-foreground",
  month_grid: "w-full border-collapse",
  weekdays: "grid grid-cols-7",
  weekday: "py-2 text-center text-xs font-medium text-muted-foreground",
  week: "grid grid-cols-7",
  day: "relative flex items-center justify-center p-0",
  day_button:
    "h-9 w-9 rounded-md text-sm transition-colors hover:bg-card-secondary",
  selected: "bg-primary text-white hover:bg-primary-hover",
  today: "font-semibold text-primary",
  outside: "text-muted-foreground/40",
};

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    onChange(formatDate(date));
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
        className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-card-secondary focus:border-primary"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? formatDisplayDate(value) : "Select date"}
        </span>

        <span className="text-muted-foreground">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 rounded-lg border bg-card p-3 shadow-xl">
          <DayPicker
            mode="single"
            selected={parseDate(value)}
            onSelect={handleSelect}
            classNames={dayPickerClassNames}
          />

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-3 w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-card-secondary"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
