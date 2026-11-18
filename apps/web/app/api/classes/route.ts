import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { classes } from "@asebili/database/schema";
import { getCurrentUser } from "../../../lib/api-auth";
import { db } from "../../../lib/db";
import { jsonError, readJson } from "../../../lib/http";
import {
  generateAccessCode,
  newId,
  toDashboardClass,
} from "../../../lib/server-utils";

export const runtime = "nodejs";

type CreateClassBody = {
  name?: unknown;
};

async function createUniqueAccessCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const accessCode = generateAccessCode();
    const existing = await db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.accessCode, accessCode))
      .limit(1);

    if (existing.length === 0) {
      return accessCode;
    }
  }

  throw new Error("Could not generate a unique class code.");
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.instructorId, user.id))
    .orderBy(desc(classes.createdAt));

  return NextResponse.json({ classes: rows.map(toDashboardClass) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const body = (await readJson(request)) as CreateClassBody | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (name.length < 2) {
    return jsonError("Class name must have at least 2 characters.");
  }

  const [created] = await db
    .insert(classes)
    .values({
      id: newId(),
      instructorId: user.id,
      accessCode: await createUniqueAccessCode(),
      name,
    })
    .returning();

  if (!created) {
    return jsonError("Class could not be created.", 500);
  }

  return NextResponse.json(
    { class: toDashboardClass(created) },
    { status: 201 },
  );
}
