import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "BentoGWA",
  description: "Premium Academic GWA Tracking Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}