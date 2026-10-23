import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"]
})


export const metadata: Metadata = {
  title: "Vellum",
  description: "Full-Stack Development",
  icons: {
    icon: "/logo/vellum-logo.png",
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col {cormorant.variable}">
        {children}
      </body>
    </html>
  );
}
