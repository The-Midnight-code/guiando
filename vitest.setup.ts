import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
  override: true,
});

if (
  process.env.DATABASE_URL !==
  "postgresql://postgres:postgres@localhost:5432/tour_management_test"
) {
  throw new Error("Tests must use the tour_management_test database.");
}
