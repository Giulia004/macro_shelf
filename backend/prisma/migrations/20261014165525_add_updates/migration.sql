/*
  Warnings:

  - You are about to drop the column `consumetAt` on the `mealentry` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `mealentry` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `mealentry` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `recipe` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `recipeingredient` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `recipeingredient` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `MealEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mealentry` DROP FOREIGN KEY `MealEntry_userId_fkey`;

-- DropIndex
DROP INDEX `MealEntry_userId_consumetAt_idx` ON `mealentry`;

-- DropIndex
DROP INDEX `MealEntry_userId_mealType_consumetAt_idx` ON `mealentry`;

-- AlterTable
ALTER TABLE `mealentry` DROP COLUMN `consumetAt`,
    DROP COLUMN `createAt`,
    DROP COLUMN `updateAt`,
    ADD COLUMN `consumedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `recipe` DROP COLUMN `updateAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `recipeingredient` DROP COLUMN `createAt`,
    DROP COLUMN `updateAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `MealEntry_userId_consumedAt_idx` ON `MealEntry`(`userId`, `consumedAt`);

-- CreateIndex
CREATE INDEX `MealEntry_userId_mealType_consumedAt_idx` ON `MealEntry`(`userId`, `mealType`, `consumedAt`);

-- AddForeignKey
ALTER TABLE `MealEntry` ADD CONSTRAINT `MealEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
