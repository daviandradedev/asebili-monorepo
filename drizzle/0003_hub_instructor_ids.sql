ALTER TABLE "asebili"."activities" DROP CONSTRAINT IF EXISTS "activities_instructor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "asebili"."classes" DROP CONSTRAINT IF EXISTS "classes_instructor_id_user_id_fk";
--> statement-breakpoint
UPDATE "asebili"."classes" AS c SET "instructor_id" = lower(trim(u."email")) FROM "user" AS u WHERE c."instructor_id" = u."id";
--> statement-breakpoint
UPDATE "asebili"."activities" AS a SET "instructor_id" = lower(trim(u."email")) FROM "user" AS u WHERE a."instructor_id" = u."id";
