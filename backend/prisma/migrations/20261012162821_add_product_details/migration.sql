/*
  Warnings:

  - You are about to drop the column `dataSource` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `nutritionBaseUnit` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `nutritionBaseValue` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `dataSource`,
    DROP COLUMN `isVerified`,
    DROP COLUMN `nutritionBaseUnit`,
    DROP COLUMN `nutritionBaseValue`,
    ADD COLUMN `unit` VARCHAR(191) NOT NULL DEFAULT 'g';
