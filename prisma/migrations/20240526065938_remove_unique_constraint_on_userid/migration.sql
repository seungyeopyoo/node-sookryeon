-- CreateTable
CREATE TABLE `User` (
    `userid` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('APPLICANT', 'RECRUITER') NOT NULL DEFAULT 'APPLICANT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserInfo_userid_key`(`userid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resume` (
    `resumeid` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS') NOT NULL DEFAULT 'APPLY',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`resumeid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResumeUpdate` (
    `resumeid` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `oldstatus` ENUM('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS') NOT NULL DEFAULT 'APPLY',
    `newstatus` ENUM('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS') NOT NULL DEFAULT 'APPLY',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`resumeid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserInfo` ADD CONSTRAINT `UserInfo_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`userid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resume` ADD CONSTRAINT `Resume_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`userid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResumeUpdate` ADD CONSTRAINT `ResumeUpdate_resumeid_fkey` FOREIGN KEY (`resumeid`) REFERENCES `Resume`(`resumeid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResumeUpdate` ADD CONSTRAINT `ResumeUpdate_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`userid`) ON DELETE CASCADE ON UPDATE CASCADE;
