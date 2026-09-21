"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(nextPage));

    router.push(`/admin/scheduled-tours?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => goToPage(pageNumber)}
            className={
              pageNumber === page
                ? "rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            }
          >
            {pageNumber}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
