-- DropForeignKey
ALTER TABLE "blog" DROP CONSTRAINT "blog_category_id_fkey";

-- AlterTable
ALTER TABLE "blog" ALTER COLUMN "category_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
