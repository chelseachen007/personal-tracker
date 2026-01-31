-- AlterTable
ALTER TABLE "exercise_records" ADD COLUMN "avg_heart_rate" INTEGER;
ALTER TABLE "exercise_records" ADD COLUMN "avg_pace" REAL;
ALTER TABLE "exercise_records" ADD COLUMN "cadence" INTEGER;
ALTER TABLE "exercise_records" ADD COLUMN "device" TEXT;
ALTER TABLE "exercise_records" ADD COLUMN "equipment" TEXT;
ALTER TABLE "exercise_records" ADD COLUMN "max_elevation" REAL;
ALTER TABLE "exercise_records" ADD COLUMN "max_heart_rate" INTEGER;
ALTER TABLE "exercise_records" ADD COLUMN "max_speed" REAL;
ALTER TABLE "exercise_records" ADD COLUMN "min_elevation" REAL;
ALTER TABLE "exercise_records" ADD COLUMN "tags" TEXT;
ALTER TABLE "exercise_records" ADD COLUMN "total_climb" REAL;
ALTER TABLE "exercise_records" ADD COLUMN "total_descent" REAL;
ALTER TABLE "exercise_records" ADD COLUMN "trackPoints" TEXT;
