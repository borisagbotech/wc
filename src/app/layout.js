import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "What Campaign – Dashboard",
  description: "SaaS WhatsApp marketing dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased font-sans bg-gray-50 text-gray-900`}>{children}</body>
    </html>
  );
}
