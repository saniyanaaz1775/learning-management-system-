-- Make users.phone nullable so registration works without phone (LMS schema has no phone)
ALTER TABLE `users` MODIFY COLUMN `phone` VARCHAR(191) NULL;
