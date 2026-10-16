-- AlterTable
ALTER TABLE `product` ADD COLUMN `fiber` DOUBLE NULL,
    ADD COLUMN `isCustom` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `salt` DOUBLE NULL,
    ADD COLUMN `saturatedFat` DOUBLE NULL,
    ADD COLUMN `sugar` DOUBLE NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `recipe` ADD COLUMN `caloriesPerServing` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `carbsPerServing` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `fatsPerServing` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `proteinsPerServing` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `WeightLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WeightLog_userId_loggedAt_idx`(`userId`, `loggedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_userId_idx` ON `Product`(`userId`);

-- CreateIndex
CREATE INDEX `Recipe_userId_idx` ON `Recipe`(`userId`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeightLog` ADD CONSTRAINT `WeightLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
