import { db } from "@/db/db";

export async function getTourTypes() {
  return db.query.tourTypes.findMany({
    where: {
      active: true,
    },
  });
}

export async function getTourClasses() {
  return db.query.tourClasses.findMany({
    where: {
      active: true,
    },
  });
}

export async function getPickupLocations() {
  return db.query.pickupLocations.findMany({
    where: {
      active: true,
    },
  });
}

export async function getAffiliates() {
  return db.query.affiliates.findMany({
    where: {
      active: true,
    },
  });
}

export async function getPaymentTypes() {
  return db.query.paymentTypes.findMany({
    where: {
      active: true,
    },
  });
}
