/*
  Warnings:

  - You are about to drop the column `goal` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `goal`;

-- CreateTable
CREATE TABLE `Recipe` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `prepTimeMinutes` INTEGER NOT NULL DEFAULT 0,
    `cookTimeMinutes` INTEGER NOT NULL DEFAULT 0,
    `difficulty` VARCHAR(191) NOT NULL DEFAULT 'EASY',
    `servings` INTEGER NOT NULL DEFAULT 2,
    `instructions` TEXT NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Recipe_slug_key`(`slug`),
    INDEX `Recipe_title_idx`(`title`),
    INDEX `Recipe_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeIngredient` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'g',
    `isOptional` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `RecipeIngredient_recipeId_idx`(`recipeId`),
    INDEX `RecipeIngredient_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealEntry` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `recipeId` VARCHAR(191) NULL,
    `mealType` ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK') NOT NULL DEFAULT 'SNACK',
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unit` VARCHAR(191) NOT NULL,
    `consumetAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `calories` DOUBLE NOT NULL,
    `proteins` DOUBLE NOT NULL,
    `carbs` DOUBLE NOT NULL,
    `fats` DOUBLE NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `MealEntry_userId_consumetAt_idx`(`userId`, `consumetAt`),
    INDEX `MealEntry_userId_mealType_consumetAt_idx`(`userId`, `mealType`, `consumetAt`),
    INDEX `MealEntry_productId_idx`(`productId`),
    INDEX `MealEntry_recipeId_idx`(`recipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_name_idx` ON `Product`(`name`);

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealEntry` ADD CONSTRAINT `MealEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealEntry` ADD CONSTRAINT `MealEntry_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealEntry` ADD CONSTRAINT `MealEntry_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
