import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best company schedules",
  description: "Employee schedules management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <h1 className="app-title">Best company schedules</h1>
        </header>

        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
