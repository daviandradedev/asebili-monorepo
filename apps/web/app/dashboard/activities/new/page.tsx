import { getServerSession } from "../../../../lib/session";
import { SignInRequired } from "../../../../components/sign-in-required";
import ActivityBuilderClient from "./activity-builder-client";

export default async function NewActivityPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return <SignInRequired />;
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
