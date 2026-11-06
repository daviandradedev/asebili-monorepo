import { cache } from "react";
import { headers } from "next/headers";
import { readSession } from "./auth";

export const getServerSession = cache(async () => readSession(await headers()));
