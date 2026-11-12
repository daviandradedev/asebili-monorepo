import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "../components/providers";
import { readLanguageCookie, readThemeCookie } from "../lib/preferences";
import { SkipLink } from "../components/skip-link";
import { SiteFooter } from "../components/site-footer";
import { GuestSessionModal } from "../components/guest-session-modal";
import { SessionKeepAlive } from "../components/session-keep-alive";
import { getServerSession } from "../lib/session";
import "./globals.css";
import VLibrasWidget from "./vlibras-widget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Asebili",
  description:
    "Teaches written Portuguese to deaf LIBRAS users. LIBRAS is the instruction medium, not the subject.",
};

const themeInitScript = `(function(){try{var match=document.cookie.match(/(?:^|; )theme=(light|dark)/);var t=match?match[1]:localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  const signedIn = Boolean(session?.user);
  const cookieStore = await cookies();
  const theme = readThemeCookie(cookieStore.get("theme")?.value);
  const language = readLanguageCookie(cookieStore.get("language")?.value);
  const dark = theme !== "light";

  return (
    <html
      lang={language === "en" ? "en" : "pt-BR"}
      className={`${inter.variable}${dark ? " dark" : " light"}`}
      style={{ colorScheme: dark ? "dark" : "light" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <Providers initialTheme={theme} initialLanguage={language}>
          {signedIn ? <SessionKeepAlive /> : <GuestSessionModal />}
          <div className="app-shell">
            <SkipLink />
            {children}
            <SiteFooter />
          </div>
        </Providers>
        <VLibrasWidget />
      </body>
    </html>
  );
}
