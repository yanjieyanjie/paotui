-- AlterTable
ALTER TABLE `order` ADD COLUMN `acceptedById` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Order_acceptedById_idx` ON `Order`(`acceptedById`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_acceptedById_fkey` FOREIGN KEY (`acceptedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
