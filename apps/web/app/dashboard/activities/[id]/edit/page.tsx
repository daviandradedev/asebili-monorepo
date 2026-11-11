import { notFound } from "next/navigation";
import { getInstructorActivity } from "../../../../../lib/dashboard-data";
import { getServerSession } from "../../../../../lib/session";
import { SignInRequired } from "../../../../../components/sign-in-required";
import ActivityBuilderClient from "../../new/activity-builder-client";

type EditActivityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    return <SignInRequired />;
  }

  const { id } = await params;
  const activity = await getInstructorActivity(session.user.id, id);

  if (!activity) {
    notFound();
  }

  return (
    <ActivityBuilderClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
      initialClasses={[]}
      initialActivity={activity}
    />
  );
}
