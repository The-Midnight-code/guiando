import "dotenv/config";

import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  affiliates,
  paymentTypes,
  pickupLocations,
  tourClasses,
  tourTypes,
  tours,
  tourPhotos,
  scheduledTours,
  travelers,
  scheduledTourTravelers,
  guides,
  scheduledTourGuides,
  users,
  tourFinancials,
} from "./schema";

async function seed() {
  console.log("Starting database seed...");

  // Tour Types
  await db
    .insert(tourTypes)
    .values([
      {
        name: "Private",
        description: "Private tour for an individual group.",
      },
      {
        name: "Shared",
        description: "Shared tour with other travelers.",
      },
    ])
    .onConflictDoNothing();

  // Tour Classes
  await db
    .insert(tourClasses)
    .values([
      {
        name: "Standard",
        description: "Standard tour experience.",
      },
      {
        name: "Premium",
        description: "Premium tour experience.",
      },
    ])
    .onConflictDoNothing();

  // Pickup Locations
  await db
    .insert(pickupLocations)
    .values([
      {
        name: "Tijuana Airport",
        address: "Tijuana International Airport, Tijuana, Baja California",
        instructions: "Meet the guide at the designated pickup area.",
        latitude: "32.5411",
        longitude: "-116.9701",
      },
      {
        name: "Downtown Tijuana",
        address: "Downtown Tijuana, Baja California",
        instructions: "Meet the guide at the agreed pickup point.",
        latitude: "32.5149",
        longitude: "-117.0382",
      },
    ])
    .onConflictDoNothing();

  // Affiliates
  await db
    .insert(affiliates)
    .values([
      {
        name: "Direct",
        description: "Direct booking from the tour company.",
      },
      {
        name: "Hotel",
        description: "Booking received through a hotel.",
      },
      {
        name: "Travel Agency",
        description: "Booking received through a travel agency.",
      },
    ])
    .onConflictDoNothing();

  // Payment Types
  await db
    .insert(paymentTypes)
    .values([
      {
        name: "Cash",
        description: "Cash payment.",
      },
      {
        name: "Credit Card",
        description: "Credit or debit card payment.",
      },
      {
        name: "Bank Transfer",
        description: "Bank transfer payment.",
      },
    ])
    .onConflictDoNothing();

  // Tours
  const [privateTourType] = await db
    .select()
    .from(tourTypes)
    .where(eq(tourTypes.name, "Private"))
    .limit(1);

  const [sharedTourType] = await db
    .select()
    .from(tourTypes)
    .where(eq(tourTypes.name, "Shared"))
    .limit(1);

  const [standardTourClass] = await db
    .select()
    .from(tourClasses)
    .where(eq(tourClasses.name, "Standard"))
    .limit(1);

  const [premiumTourClass] = await db
    .select()
    .from(tourClasses)
    .where(eq(tourClasses.name, "Premium"))
    .limit(1);

  if (
    !privateTourType ||
    !sharedTourType ||
    !standardTourClass ||
    !premiumTourClass
  ) {
    throw new Error("Required tour catalogs were not found.");
  }

  await db
    .insert(tours)
    .values([
      {
        productId: "TOUR-001",
        name: "Tijuana City Tour",
        description: "Explore the main attractions of Tijuana.",
        duration: 180,
        price: "75.00",
        tourTypeId: privateTourType.id,
        tourClassId: standardTourClass.id,
      },
      {
        productId: "TOUR-002",
        name: "Valle de Guadalupe Wine Tour",
        description: "Discover wineries and local gastronomy.",
        duration: 480,
        price: "150.00",
        tourTypeId: privateTourType.id,
        tourClassId: premiumTourClass.id,
      },
      {
        productId: "TOUR-003",
        name: "Baja California Shared Experience",
        description: "Enjoy a shared experience with other travelers.",
        duration: 360,
        price: "95.00",
        tourTypeId: sharedTourType.id,
        tourClassId: standardTourClass.id,
      },
    ])
    .onConflictDoNothing();

  // Tour Photos
  const [cityTour] = await db
    .select()
    .from(tours)
    .where(eq(tours.productId, "TOUR-001"))
    .limit(1);

  const [wineTour] = await db
    .select()
    .from(tours)
    .where(eq(tours.productId, "TOUR-002"))
    .limit(1);

  const [sharedTour] = await db
    .select()
    .from(tours)
    .where(eq(tours.productId, "TOUR-003"))
    .limit(1);

  if (!cityTour || !wineTour || !sharedTour) {
    throw new Error("Required tours were not found.");
  }

  await db
    .insert(tourPhotos)
    .values([
      {
        tourId: cityTour.id,
        url: "https://example.com/images/tijuana-city-tour.jpg",
        alt: "Tijuana City Tour",
        sortOrder: 0,
      },
      {
        tourId: wineTour.id,
        url: "https://example.com/images/valle-de-guadalupe.jpg",
        alt: "Valle de Guadalupe Wine Tour",
        sortOrder: 0,
      },
      {
        tourId: sharedTour.id,
        url: "https://example.com/images/baja-california-experience.jpg",
        alt: "Baja California Shared Experience",
        sortOrder: 0,
      },
    ])
    .onConflictDoNothing();

  // Scheduled Tours

  const [airportPickup] = await db
    .select()
    .from(pickupLocations)
    .where(eq(pickupLocations.name, "Tijuana Airport"))
    .limit(1);

  const [downtownPickup] = await db
    .select()
    .from(pickupLocations)
    .where(eq(pickupLocations.name, "Downtown Tijuana"))
    .limit(1);

  const [directAffiliate] = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.name, "Direct"))
    .limit(1);

  const [hotelAffiliate] = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.name, "Hotel"))
    .limit(1);

  const [cashPayment] = await db
    .select()
    .from(paymentTypes)
    .where(eq(paymentTypes.name, "Cash"))
    .limit(1);

  const [cardPayment] = await db
    .select()
    .from(paymentTypes)
    .where(eq(paymentTypes.name, "Credit Card"))
    .limit(1);

  if (
    !cityTour ||
    !wineTour ||
    !airportPickup ||
    !downtownPickup ||
    !directAffiliate ||
    !hotelAffiliate ||
    !cashPayment ||
    !cardPayment
  ) {
    throw new Error("Required data for scheduled tours was not found.");
  }

  await db
    .insert(scheduledTours)
    .values([
      {
        tourId: cityTour.id,
        externalId: 1001,
        status: "CONFIRMED",
        bookingDate: "2026-09-15",
        tourDate: "2026-10-05",
        pickupLocationId: airportPickup.id,
        affiliateId: directAffiliate.id,
        paymentTypeId: cashPayment.id,
        startTime: "09:00",
        endTime: "12:00",
        locationStart: "Tijuana Airport",
        locationEnd: "Downtown Tijuana",
        numberOfPeople: 2,
        specialIndications: "Guest prefers English-speaking guide.",
        tip: "10.00",
      },
      {
        tourId: wineTour.id,
        externalId: 1002,
        status: "PENDING",
        bookingDate: "2026-09-16",
        tourDate: "2026-10-10",
        pickupLocationId: downtownPickup.id,
        affiliateId: hotelAffiliate.id,
        paymentTypeId: cardPayment.id,
        startTime: "08:00",
        endTime: "16:00",
        locationStart: "Downtown Tijuana",
        locationEnd: "Downtown Tijuana",
        numberOfPeople: 4,
        specialIndications: "Vegetarian lunch requested.",
        tip: "20.00",
      },
    ])
    .onConflictDoNothing({
      target: scheduledTours.externalId,
    })
    .returning();

  const [scheduledTour1] = await db
    .select()
    .from(scheduledTours)
    .where(eq(scheduledTours.externalId, 1001))
    .limit(1);

  const [scheduledTour2] = await db
    .select()
    .from(scheduledTours)
    .where(eq(scheduledTours.externalId, 1002))
    .limit(1);

  if (!scheduledTour1 || !scheduledTour2) {
    throw new Error("Scheduled tours were not found.");
  }

  // Travelers
  const travelerData = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+1 555-0101",
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1 555-0102",
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      phone: "+1 555-0103",
    },
    {
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      phone: "+1 555-0104",
    },
  ];

  for (const traveler of travelerData) {
    const [existingTraveler] = await db
      .select()
      .from(travelers)
      .where(eq(travelers.email, traveler.email))
      .limit(1);

    if (!existingTraveler) {
      await db.insert(travelers).values(traveler);
    }
  }

  const [john] = await db
    .select()
    .from(travelers)
    .where(eq(travelers.email, "john.smith@example.com"))
    .limit(1);

  const [sarah] = await db
    .select()
    .from(travelers)
    .where(eq(travelers.email, "sarah.johnson@example.com"))
    .limit(1);

  const [michael] = await db
    .select()
    .from(travelers)
    .where(eq(travelers.email, "michael.brown@example.com"))
    .limit(1);

  const [emily] = await db
    .select()
    .from(travelers)
    .where(eq(travelers.email, "emily.davis@example.com"))
    .limit(1);

  if (!john || !sarah || !michael || !emily) {
    throw new Error("Travelers were not found.");
  }

  await db
    .insert(scheduledTourTravelers)
    .values([
      {
        scheduledTourId: scheduledTour1.id,
        travelerId: john.id,
      },
      {
        scheduledTourId: scheduledTour1.id,
        travelerId: sarah.id,
      },
      {
        scheduledTourId: scheduledTour2.id,
        travelerId: michael.id,
      },
      {
        scheduledTourId: scheduledTour2.id,
        travelerId: emily.id,
      },
    ])
    .onConflictDoNothing();

  // Guide Users

  await db
    .insert(users)
    .values([
      {
        clerkId: "seed-guide-001",
        email: "carlos.guide@example.com",
        firstName: "Carlos",
        lastName: "Garcia",
        role: "GUIDE",
      },
      {
        clerkId: "seed-guide-002",
        email: "ana.guide@example.com",
        firstName: "Ana",
        lastName: "Martinez",
        role: "GUIDE",
      },
    ])
    .onConflictDoNothing();

  const [carlosUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, "seed-guide-001"))
    .limit(1);

  const [anaUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, "seed-guide-002"))
    .limit(1);

  if (!carlosUser || !anaUser) {
    throw new Error("Guide users were not found.");
  }

  await db
    .insert(guides)
    .values([
      {
        userId: carlosUser.id,
        phone: "+1 555-0201",
        active: true,
      },
      {
        userId: anaUser.id,
        phone: "+1 555-0202",
        active: true,
      },
    ])
    .onConflictDoNothing();

  const [carlosGuide] = await db
    .select()
    .from(guides)
    .where(eq(guides.userId, carlosUser.id))
    .limit(1);

  const [anaGuide] = await db
    .select()
    .from(guides)
    .where(eq(guides.userId, anaUser.id))
    .limit(1);

  if (!carlosGuide || !anaGuide) {
    throw new Error("Guide profiles were not found.");
  }

  await db
    .insert(scheduledTourGuides)
    .values([
      {
        scheduledTourId: scheduledTour1.id,
        guideId: carlosGuide.id,
      },
      {
        scheduledTourId: scheduledTour2.id,
        guideId: anaGuide.id,
      },
    ])
    .onConflictDoNothing();

  // Tour Financials

  await db
    .insert(tourFinancials)
    .values([
      {
        scheduledTourId: scheduledTour1.id,

        totalPaymentUsd: "150.00",

        guideCostMxn: "800.00",
        transportationCostMxn: "500.00",
        travelersCostMxn: "300.00",
        totalTravelersCostMxn: "600.00",

        extraExpensesMxn: "100.00",

        totalCostMxn: "2000.00",
        totalCostUsd: "115.00",

        totalRevenueUsd: "35.00",
        revenuePercentage: "23.33",
      },
      {
        scheduledTourId: scheduledTour2.id,

        totalPaymentUsd: "600.00",

        guideCostMxn: "1500.00",
        transportationCostMxn: "1200.00",
        travelersCostMxn: "500.00",
        totalTravelersCostMxn: "2000.00",

        extraExpensesMxn: "300.00",

        totalCostMxn: "5000.00",
        totalCostUsd: "285.00",

        totalRevenueUsd: "315.00",
        revenuePercentage: "52.50",
      },
    ])
    .onConflictDoNothing();

  console.log("Database seed completed successfully.");
}

seed().catch((error) => {
  console.error("Database seed failed:", error);
  process.exit(1);
});
