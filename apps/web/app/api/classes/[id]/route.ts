import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { classes } from "@asebili/database/schema";
import { getCurrentUser } from "../../../../lib/api-auth";
import { db } from "../../../../lib/db";
import { jsonError, readJson } from "../../../../lib/http";
import { toDashboardClass } from "../../../../lib/server-utils";

export const runtime = "nodejs";

type UpdateClassBody = {
  name?: unknown;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getOwnedClass(instructorId: string, classId: string) {
  const [row] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.instructorId, instructorId)))
    .limit(1);

  return row ?? null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const existing = await getOwnedClass(user.id, id);

  if (!existing) {
    return jsonError("Class not found.", 404);
  }

  const body = (await readJson(request)) as UpdateClassBody | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (name.length < 2) {
    return jsonError("Class name must have at least 2 characters.");
  }

  const [updated] = await db
    .update(classes)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(classes.id, id))
    .returning();

  if (!updated) {
    return jsonError("Class could not be updated.", 500);
  }

  return NextResponse.json({ class: toDashboardClass(updated) });
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const existing = await getOwnedClass(user.id, id);

  if (!existing) {
    return jsonError("Class not found.", 404);
  }

  await db.delete(classes).where(eq(classes.id, id));

  return NextResponse.json({ ok: true });
}
