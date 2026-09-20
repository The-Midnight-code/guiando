import { db } from "@/db/db";
import { eq } from "drizzle-orm";

import { pickupLocations } from "@/db/schema";

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
  const [pickupLocation] = await db
    .insert(pickupLocations)
    .values({
      name: input.name,
      address: input.address,
      instructions: input.instructions,
      latitude: input.latitude,
      longitude: input.longitude,
      active: input.active ?? true,
    })
    .returning();

  return pickupLocation;
}

export async function updatePickupLocation(
  id: string,
  input: CreatePickupLocationInput,
) {
  const [pickupLocation] = await db
    .update(pickupLocations)
    .set({
      name: input.name,
      address: input.address,
      instructions: input.instructions,
      latitude: input.latitude,
      longitude: input.longitude,
      active: input.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(pickupLocations.id, id))
    .returning();

  return pickupLocation;
}

export async function togglePickupLocationActive(id: string, active: boolean) {
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
