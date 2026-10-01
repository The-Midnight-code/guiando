import { db } from "@/db/db";

import { eq } from "drizzle-orm";

import { pickupLocations } from "@/db/schema";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validateUuid(value: string, fieldName: string): void {
  if (!isValidUuid(value)) {
    throw new Error(`${fieldName} must be a valid UUID.`);
  }
}

function validatePickupLocationInput(input: CreatePickupLocationInput): void {
  if (!input.name.trim()) {
    throw new Error("Pickup location name is required.");
  }

  if (!input.address.trim()) {
    throw new Error("Pickup location address is required.");
  }
}

export async function getPickupLocations() {
  return db.query.pickupLocations.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getActivePickupLocations() {
  return db.query.pickupLocations.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getPickupLocationById(id: string) {
  validateUuid(id, "Pickup location ID");

  return db.query.pickupLocations.findFirst({
    where: {
      id,
    },
  });
}

export interface CreatePickupLocationInput {
  name: string;
  address: string;
  instructions?: string;
  latitude?: string;
  longitude?: string;
  active?: boolean;
}

export async function createPickupLocation(input: CreatePickupLocationInput) {
  validatePickupLocationInput(input);

  const [pickupLocation] = await db
    .insert(pickupLocations)
    .values({
      name: input.name.trim(),
      address: input.address.trim(),
      instructions: input.instructions?.trim() || undefined,
      latitude: input.latitude?.trim() || undefined,
      longitude: input.longitude?.trim() || undefined,
      active: input.active ?? true,
    })
    .returning();

  return pickupLocation;
}

export async function updatePickupLocation(
  id: string,
  input: CreatePickupLocationInput,
) {
  validateUuid(id, "Pickup location ID");
  validatePickupLocationInput(input);

  const [pickupLocation] = await db
    .update(pickupLocations)
    .set({
      name: input.name.trim(),
      address: input.address.trim(),
      instructions: input.instructions?.trim() || undefined,
      latitude: input.latitude?.trim() || undefined,
      longitude: input.longitude?.trim() || undefined,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(pickupLocations.id, id))
    .returning();

  return pickupLocation;
}

export async function togglePickupLocationActive(id: string, active: boolean) {
  validateUuid(id, "Pickup location ID");

  const [pickupLocation] = await db
    .update(pickupLocations)
    .set({
      active,
      updatedAt: new Date(),
    })
    .where(eq(pickupLocations.id, id))
    .returning();

  return pickupLocation;
}
