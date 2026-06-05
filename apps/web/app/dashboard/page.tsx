import { redirect } from "next/navigation";
import { getDashboardData } from "../../lib/dashboard-data";
import { provisionInstructorSampleData } from "../../lib/provision-instructor-sample";
import { getServerSession } from "../../lib/session";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  await provisionInstructorSampleData(session.user.id);
  const dashboardData = await getDashboardData(session.user.id);

  const studentAppUrl = process.env.NEXT_PUBLIC_STUDENT_APP_URL?.trim() || "";

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
      studentAppUrl={studentAppUrl}
      initialActivities={dashboardData.activities}
      initialClasses={dashboardData.classes}
      initialLogs={dashboardData.logs}
    />
  );
}
