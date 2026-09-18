import type { Metadata } from "next";
import { LanguageProvider } from "@/i18n/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Just My LLC — Form Your US LLC & Open Stripe",
  description: "The quickest way for global entrepreneurs to form a New Mexico LLC, get an EIN, and open a Stripe account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
