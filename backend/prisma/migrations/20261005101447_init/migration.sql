/*
  Warnings:

  - You are about to drop the `pantryitem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `pantryitem` DROP FOREIGN KEY `PantryItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `pantryitem` DROP FOREIGN KEY `PantryItem_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isPremium` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `pantryitem`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
