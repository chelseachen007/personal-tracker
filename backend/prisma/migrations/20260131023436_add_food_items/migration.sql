-- CreateTable
CREATE TABLE "food_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "serving_size" REAL,
    "serving_unit" TEXT,
    "calories" INTEGER,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "fiber" REAL,
    "sugar" REAL,
    "sodium" REAL,
    "source" TEXT NOT NULL DEFAULT 'custom',
    "source_id" TEXT,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "food_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_meal_records" (
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
    "food_item_id" INTEGER,
    "barcode" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meal_records_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_meal_records" ("calories", "carbs", "created_at", "fat", "food_name", "id", "meal_date", "meal_type", "notes", "protein", "user_id") SELECT "calories", "carbs", "created_at", "fat", "food_name", "id", "meal_date", "meal_type", "notes", "protein", "user_id" FROM "meal_records";
DROP TABLE "meal_records";
ALTER TABLE "new_meal_records" RENAME TO "meal_records";
CREATE INDEX "meal_records_user_id_meal_date_idx" ON "meal_records"("user_id", "meal_date");
CREATE INDEX "meal_records_user_id_barcode_idx" ON "meal_records"("user_id", "barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "food_items_barcode_key" ON "food_items"("barcode");

-- CreateIndex
CREATE INDEX "food_items_user_id_barcode_idx" ON "food_items"("user_id", "barcode");

-- CreateIndex
CREATE INDEX "food_items_user_id_name_idx" ON "food_items"("user_id", "name");

-- CreateIndex
CREATE INDEX "food_items_user_id_source_idx" ON "food_items"("user_id", "source");
