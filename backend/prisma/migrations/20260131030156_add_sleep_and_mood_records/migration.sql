-- CreateTable
CREATE TABLE "sleep_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "sleep_date" DATETIME NOT NULL,
    "bed_time" DATETIME,
    "wake_time" DATETIME,
    "duration_hours" REAL,
    "quality" INTEGER,
    "interruptions" INTEGER DEFAULT 0,
    "time_to_fall_asleep" INTEGER,
    "mood_before_sleep" TEXT,
    "mood_upon_waking" TEXT,
    "energy_level" INTEGER,
    "tags" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sleep_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mood_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "record_date" DATETIME NOT NULL,
    "mood" INTEGER NOT NULL,
    "energy" INTEGER,
    "stress" INTEGER,
    "mood_tags" TEXT,
    "physical_state" INTEGER,
    "activities" TEXT,
    "weather" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mood_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "sleep_records_user_id_sleep_date_idx" ON "sleep_records"("user_id", "sleep_date");

-- CreateIndex
CREATE INDEX "mood_records_user_id_record_date_idx" ON "mood_records"("user_id", "record_date");
