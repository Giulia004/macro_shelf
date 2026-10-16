-- DropForeignKey
ALTER TABLE `recipeingredient` DROP FOREIGN KEY `RecipeIngredient_productId_fkey`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `dataSource` VARCHAR(191) NULL,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `nutritionBaseUnit` VARCHAR(191) NOT NULL DEFAULT 'g',
    ADD COLUMN `nutritionBaseValue` DOUBLE NOT NULL DEFAULT 100;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
