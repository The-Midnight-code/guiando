CREATE TABLE "guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE,
	"phone" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pickup_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"address" text NOT NULL,
	"instructions" text,
	"latitude" text,
	"longitude" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" text UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"duration" integer,
	"price" numeric(10,2),
	"tour_type_id" uuid NOT NULL,
	"tour_class_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tour_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tour_id" uuid NOT NULL,
	"external_id" integer UNIQUE,
	"status" text NOT NULL,
	"booking_date" date,
	"tour_date" date NOT NULL,
	"pickup_location_id" uuid NOT NULL,
	"affiliate_id" uuid,
	"payment_type_id" uuid,
	"start_time" time,
	"end_time" time,
	"location_start" text,
	"location_end" text,
	"number_of_people" integer,
	"special_indications" text,
	"payment_type" text,
	"tip" numeric(10,2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_tour_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scheduled_tour_id" uuid NOT NULL,
	"guide_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scheduled_tour_guide_unique" UNIQUE("scheduled_tour_id","guide_id")
);
--> statement-breakpoint
CREATE TABLE "travelers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_tour_travelers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scheduled_tour_id" uuid NOT NULL,
	"traveler_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scheduled_tour_traveler_unique" UNIQUE("scheduled_tour_id","traveler_id")
);
--> statement-breakpoint
CREATE TABLE "tour_financials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scheduled_tour_id" uuid NOT NULL UNIQUE,
	"total_payment_usd" numeric(12,2),
	"guide_cost_mxn" numeric(12,2),
	"transportation_cost_mxn" numeric(12,2),
	"travelers_cost_mxn" numeric(12,2),
	"total_travelers_cost_mxn" numeric(12,2),
	"extra_expenses_mxn" numeric(12,2),
	"total_cost_mxn" numeric(12,2),
	"total_cost_usd" numeric(12,2),
	"total_revenue_usd" numeric(12,2),
	"revenue_percentage" numeric(7,2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guides" ADD CONSTRAINT "guides_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_tour_type_id_tour_types_id_fkey" FOREIGN KEY ("tour_type_id") REFERENCES "tour_types"("id");--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_tour_class_id_tour_classes_id_fkey" FOREIGN KEY ("tour_class_id") REFERENCES "tour_classes"("id");--> statement-breakpoint
ALTER TABLE "tour_photos" ADD CONSTRAINT "tour_photos_tour_id_tours_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_tours" ADD CONSTRAINT "scheduled_tours_tour_id_tours_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id");--> statement-breakpoint
ALTER TABLE "scheduled_tours" ADD CONSTRAINT "scheduled_tours_pickup_location_id_pickup_locations_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "pickup_locations"("id");--> statement-breakpoint
ALTER TABLE "scheduled_tours" ADD CONSTRAINT "scheduled_tours_affiliate_id_affiliates_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id");--> statement-breakpoint
ALTER TABLE "scheduled_tours" ADD CONSTRAINT "scheduled_tours_payment_type_id_payment_types_id_fkey" FOREIGN KEY ("payment_type_id") REFERENCES "payment_types"("id");--> statement-breakpoint
ALTER TABLE "scheduled_tour_guides" ADD CONSTRAINT "scheduled_tour_guides_scheduled_tour_id_scheduled_tours_id_fkey" FOREIGN KEY ("scheduled_tour_id") REFERENCES "scheduled_tours"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_tour_guides" ADD CONSTRAINT "scheduled_tour_guides_guide_id_guides_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_tour_travelers" ADD CONSTRAINT "scheduled_tour_travelers_ZVcWMxtfsk6o_fkey" FOREIGN KEY ("scheduled_tour_id") REFERENCES "scheduled_tours"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_tour_travelers" ADD CONSTRAINT "scheduled_tour_travelers_traveler_id_travelers_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "travelers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_scheduled_tour_id_scheduled_tours_id_fkey" FOREIGN KEY ("scheduled_tour_id") REFERENCES "scheduled_tours"("id") ON DELETE CASCADE;