import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/layout/Header";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

// Inter servida desde el proyecto (subset latin, variable 100–900): el build no depende de
// conectarse a Google Fonts
const inter = localFont({
  src: "./fonts/Inter-latin.woff2",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FCE - Asistencia y Supervisión",
  description: "Sistema de Asistencia y Gestión de Personal FCE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
