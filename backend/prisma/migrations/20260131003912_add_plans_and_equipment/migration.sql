-- CreateTable
CREATE TABLE "exercise_plans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "target_value" REAL,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "exercise_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "purchase_date" DATETIME,
    "purchase_price" REAL,
    "total_distance" REAL NOT NULL DEFAULT 0,
    "total_hours" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "equipment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercise_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "exercise_date" DATETIME NOT NULL,
    "exercise_type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "distance_km" REAL,
    "calories_burned" INTEGER,
    "notes" TEXT,
    "avg_pace" REAL,
    "max_speed" REAL,
    "max_elevation" REAL,
    "min_elevation" REAL,
    "total_climb" REAL,
    "total_descent" REAL,
    "avg_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "cadence" INTEGER,
    "equipment" TEXT,
    "equipment_id" INTEGER,
    "tags" TEXT,
    "device" TEXT,
    "trackPoints" TEXT,
    "plan_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercise_records_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "exercise_plans" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "exercise_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "exercise_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_exercise_records" ("avg_heart_rate", "avg_pace", "cadence", "calories_burned", "created_at", "device", "distance_km", "duration_minutes", "equipment", "exercise_date", "exercise_type", "id", "max_elevation", "max_heart_rate", "max_speed", "min_elevation", "notes", "tags", "total_climb", "total_descent", "trackPoints", "user_id") SELECT "avg_heart_rate", "avg_pace", "cadence", "calories_burned", "created_at", "device", "distance_km", "duration_minutes", "equipment", "exercise_date", "exercise_type", "id", "max_elevation", "max_heart_rate", "max_speed", "min_elevation", "notes", "tags", "total_climb", "total_descent", "trackPoints", "user_id" FROM "exercise_records";
DROP TABLE "exercise_records";
ALTER TABLE "new_exercise_records" RENAME TO "exercise_records";
CREATE INDEX "exercise_records_user_id_exercise_date_idx" ON "exercise_records"("user_id", "exercise_date");
CREATE INDEX "exercise_records_plan_id_idx" ON "exercise_records"("plan_id");
CREATE INDEX "exercise_records_equipment_id_idx" ON "exercise_records"("equipment_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "exercise_plans_user_id_status_idx" ON "exercise_plans"("user_id", "status");

-- CreateIndex
CREATE INDEX "equipment_user_id_type_idx" ON "equipment"("user_id", "type");

-- CreateIndex
CREATE INDEX "equipment_user_id_status_idx" ON "equipment"("user_id", "status");
