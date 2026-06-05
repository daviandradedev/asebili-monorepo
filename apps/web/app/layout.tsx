import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../components/providers";
import { SkipLink } from "../components/skip-link";
import { SiteFooter } from "../components/site-footer";
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

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(d?'dark':'light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <Providers>
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
