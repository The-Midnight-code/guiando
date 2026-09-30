ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_total_payment_usd_non_negative" CHECK ("total_payment_usd" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_guide_cost_mxn_non_negative" CHECK ("guide_cost_mxn" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_transportation_cost_mxn_non_negative" CHECK ("transportation_cost_mxn" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_travelers_cost_mxn_non_negative" CHECK ("travelers_cost_mxn" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_total_travelers_cost_mxn_non_negative" CHECK ("total_travelers_cost_mxn" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_extra_expenses_mxn_non_negative" CHECK ("extra_expenses_mxn" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_total_cost_mxn_non_negative" CHECK ("total_cost_mxn" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_total_cost_usd_non_negative" CHECK ("total_cost_usd" >= 0);--> statement-breakpoint
ALTER TABLE "tour_financials" ADD CONSTRAINT "tour_financials_exchange_rate_positive" CHECK ("exchange_rate" > 0);