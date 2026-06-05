import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Json } from "./types";
import type { QuizSubmissionDetails } from "./quiz";

export const asebiliSchema = pgSchema("asebili");

export const authUsers = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex("user_email_idx").on(table.email)],
);

export const authSessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("session_token_idx").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const authAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const authVerifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const classes = asebiliSchema.table(
  "classes",
  {
    id: text("id").primaryKey(),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessCode: text("access_code").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("classes_access_code_idx").on(table.accessCode),
    index("classes_instructor_id_idx").on(table.instructorId),
  ],
);

export const activities = asebiliSchema.table(
  "activities",
  {
    id: text("id").primaryKey(),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    templateType: text("template_type").notNull(),
    librasVideoUrl: text("libras_video_url"),
    jsonOptions: jsonb("json_options")
      .$type<Json>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("activities_instructor_id_idx").on(table.instructorId)],
);

export const classActivities = asebiliSchema.table(
  "class_activities",
  {
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.classId, table.activityId] }),
    index("class_activities_activity_id_idx").on(table.activityId),
  ],
);

export const performanceLogs = asebiliSchema.table(
  "performance_logs",
  {
    id: text("id").primaryKey(),
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    classId: text("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    studentName: text("student_name"),
    responseTimeSeconds: doublePrecision("response_time_seconds").notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    wrongAnswers: integer("wrong_answers").default(0).notNull(),
    answerDetails: jsonb("answer_details")
      .$type<QuizSubmissionDetails | null>()
      .default(null),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("performance_logs_activity_id_idx").on(table.activityId),
    index("performance_logs_class_id_idx").on(table.classId),
  ],
);

export type ClassRow = typeof classes.$inferSelect;
export type ActivityRow = typeof activities.$inferSelect;
export type PerformanceLogRow = typeof performanceLogs.$inferSelect;
