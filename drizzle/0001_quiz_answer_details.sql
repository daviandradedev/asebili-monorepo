ALTER TABLE "asebili"."performance_logs" ADD COLUMN IF NOT EXISTS "answer_details" jsonb DEFAULT null;
