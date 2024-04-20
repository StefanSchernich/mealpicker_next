import type { Metadata } from "next";
import Providers from "@/components/Providers/Providers";
import { Inter, Lumanosimo } from "next/font/google";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const lumanosimo = Lumanosimo({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Mealpicker 2.0",
  description:
    "Mealpicker nimmt dir das Überlegen ab, was du heute kochen sollst.",
};
// STYLE: implement responsive design for tablet + desktop
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-black`}>
        <header className="bg-sky-400 p-4 text-black">
          <nav className="flex justify-between">
            <Link href="/" className="text-2xl font-bold">
              Meal <span className={lumanosimo.className}>Picker</span>{" "}
              <span className="ml-2">🌮</span>
            </Link>
            <Link href="/addDish" className="flex flex-col justify-center">
              <CirclePlus />
            </Link>
          </nav>
        </header>
        <main className="flex flex-col gap-10 overflow-hidden p-4">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
