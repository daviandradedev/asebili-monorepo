import { redirect } from "next/navigation";
import { getServerSession } from "../../../../lib/session";
import ActivityBuilderClient from "./activity-builder-client";

export default async function NewActivityPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ActivityBuilderClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
      initialClasses={[]}
    />
  );
}
