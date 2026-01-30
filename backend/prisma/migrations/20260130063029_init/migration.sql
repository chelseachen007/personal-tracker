-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "record_date" DATETIME NOT NULL,
    "weight" REAL,
    "height" REAL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "heart_rate" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meal_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "meal_date" DATETIME NOT NULL,
    "meal_type" TEXT NOT NULL,
    "food_name" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exercise_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "exercise_date" DATETIME NOT NULL,
    "exercise_type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "distance_km" REAL,
    "calories_burned" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercise_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "finance_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "record_date" DATETIME NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "finance_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "goal_type" TEXT NOT NULL,
    "target_value" REAL NOT NULL,
    "current_value" REAL NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "health_records_user_id_record_date_idx" ON "health_records"("user_id", "record_date");

-- CreateIndex
CREATE INDEX "meal_records_user_id_meal_date_idx" ON "meal_records"("user_id", "meal_date");

-- CreateIndex
CREATE INDEX "exercise_records_user_id_exercise_date_idx" ON "exercise_records"("user_id", "exercise_date");

-- CreateIndex
CREATE INDEX "finance_records_user_id_record_date_idx" ON "finance_records"("user_id", "record_date");

-- CreateIndex
CREATE INDEX "goals_user_id_goal_type_idx" ON "goals"("user_id", "goal_type");
