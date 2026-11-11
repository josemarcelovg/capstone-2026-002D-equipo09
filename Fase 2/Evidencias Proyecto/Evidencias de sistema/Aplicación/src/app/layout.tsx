import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MenuSesion } from "./menu-sesion";

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
        {/* Franja de color de la marca, arriba de todas las pantallas. */}
        <div aria-hidden="true" className="h-1.5 shrink-0 bg-orange-600" />
        <div className="flex flex-1 flex-col md:flex-row">
          {/* Menú lateral en computador y barra con "Menú" en celular. Sin sesión no muestra nada. */}
          <MenuSesion />
          <main className="w-full min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
