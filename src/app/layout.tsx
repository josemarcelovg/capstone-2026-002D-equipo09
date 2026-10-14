import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MicroLogist", template: "%s · MicroLogist" },
  description:
    "Gestión de vehículos, conductores, turnos y documentos para empresas de transporte de pasajeros.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 bg-white">
          <nav
            aria-label="Principal"
            className="mx-auto flex w-full max-w-5xl items-center gap-6 px-4 py-3"
          >
            <Link href="/" className="text-lg font-semibold text-blue-800">
              MicroLogist
            </Link>
            <Link href="/vehiculos" className="text-sm font-medium text-zinc-800 hover:underline">
              Vehículos
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
