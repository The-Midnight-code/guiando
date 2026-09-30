export function getDatabaseErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const databaseError = error as {
    code?: string;
  };

  switch (databaseError.code) {
    case "23505":
      return "A record with the same unique value already exists.";

    case "23503":
      return "One of the selected references no longer exists.";

    case "23514":
      return "One or more values violate a data constraint.";

    default:
      return null;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getScheduledTourErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  if (
    error.message ===
    "Scheduled tours with financial records cannot be deleted."
  ) {
    return error.message;
  }

  return null;
}
