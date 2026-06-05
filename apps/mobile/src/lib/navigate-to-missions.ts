import type { Router } from "expo-router";
import { getClassSession } from "./class-session";

type MissionNavInput = {
  classCode?: string;
  className?: string;
};

async function resolveMissionTarget(input: MissionNavInput) {
  const code = input.classCode?.trim().toUpperCase();
  if (code) {
    return {
      code,
      className: input.className,
    };
  }

  const saved = await getClassSession();
  if (saved?.code) {
    return {
      code: saved.code,
      className: input.className ?? saved.className,
    };
  }

  return null;
}

export async function navigateToMissionList(
  router: Router,
  input: MissionNavInput,
) {
  const target = await resolveMissionTarget(input);

  if (target) {
    router.navigate({
      pathname: "/class/[code]",
      params: {
        code: target.code,
        ...(target.className ? { className: target.className } : {}),
      },
    });
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/");
}
