import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Instrument_Serif } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { CreateFlowProvider } from "@/lib/create-flow";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Avaaz — Give your knowledge a voice",
  description: "Create your AI voice agent by simply talking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          <CreateFlowProvider>
            <div className="flex min-h-dvh flex-col">
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            </div>
          </CreateFlowProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
