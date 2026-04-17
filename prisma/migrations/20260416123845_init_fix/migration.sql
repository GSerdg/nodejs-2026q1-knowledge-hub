/*
  Warnings:

  - The values [admin,editor,viewer] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [draft,published,archived] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admins', 'editors', 'viewers');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'viewers';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('drafts', 'publisheds', 'archiveds');
ALTER TABLE "public"."Article" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Article" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "Article" ALTER COLUMN "status" SET DEFAULT 'drafts';
COMMIT;

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "status" SET DEFAULT 'drafts';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'viewers';
