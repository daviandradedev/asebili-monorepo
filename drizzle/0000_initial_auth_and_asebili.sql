CREATE SCHEMA "asebili";
--> statement-breakpoint
CREATE TABLE "asebili"."activities" (
	"id" text PRIMARY KEY NOT NULL,
	"instructor_id" text NOT NULL,
	"title" text NOT NULL,
	"template_type" text NOT NULL,
	"libras_video_url" text,
	"json_options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "asebili"."class_activities" (
	"class_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_activities_class_id_activity_id_pk" PRIMARY KEY("class_id","activity_id")
);
--> statement-breakpoint
CREATE TABLE "asebili"."classes" (
	"id" text PRIMARY KEY NOT NULL,
	"instructor_id" text NOT NULL,
	"access_code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asebili"."performance_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"activity_id" text NOT NULL,
	"class_id" text,
	"response_time_seconds" double precision NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"wrong_answers" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asebili"."activities" ADD CONSTRAINT "activities_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asebili"."class_activities" ADD CONSTRAINT "class_activities_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "asebili"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asebili"."class_activities" ADD CONSTRAINT "class_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "asebili"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asebili"."classes" ADD CONSTRAINT "classes_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asebili"."performance_logs" ADD CONSTRAINT "performance_logs_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "asebili"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asebili"."performance_logs" ADD CONSTRAINT "performance_logs_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "asebili"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_instructor_id_idx" ON "asebili"."activities" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "class_activities_activity_id_idx" ON "asebili"."class_activities" USING btree ("activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "classes_access_code_idx" ON "asebili"."classes" USING btree ("access_code");--> statement-breakpoint
CREATE INDEX "classes_instructor_id_idx" ON "asebili"."classes" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "performance_logs_activity_id_idx" ON "asebili"."performance_logs" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "performance_logs_class_id_idx" ON "asebili"."performance_logs" USING btree ("class_id");