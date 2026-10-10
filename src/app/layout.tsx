import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chá de Casa Nova da Cilce",
  description: "Um convite cheio de carinho para celebrar o novo lar da Cilce.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
