-- AlterTable
ALTER TABLE `message` ADD COLUMN `fromUserId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Message_fromUserId_idx` ON `Message`(`fromUserId`);

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_fromUserId_fkey` FOREIGN KEY (`fromUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
