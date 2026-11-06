import { SessionKeepAlive } from "../../components/session-keep-alive";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionKeepAlive />
      {children}
    </>
  );
}
