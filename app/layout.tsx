import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Redação Nota Mil - ERP Escolar",
  description: "Sistema completo de gestão acadêmica e correção de redações ENEM",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

