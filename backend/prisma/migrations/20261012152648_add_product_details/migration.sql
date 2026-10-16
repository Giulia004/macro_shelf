/*
  Warnings:

  - You are about to drop the column `unit` on the `product` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `unit`,
    ADD COLUMN `dataSource` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `nutritionBaseUnit` VARCHAR(191) NOT NULL DEFAULT 'g',
    ADD COLUMN `nutritionBaseValue` DOUBLE NOT NULL DEFAULT 100,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `user_email_key` TO `User_email_key`;
