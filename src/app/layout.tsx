import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutGrid, Package, Warehouse } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "棚割り管理システム",
  description: "小売店向け棚割り管理Webアプリケーション",
};

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutGrid },
  { href: "/products", label: "商品管理", icon: Package },
  { href: "/shelves", label: "棚管理", icon: Warehouse },
  { href: "/allocation", label: "商品配置", icon: LayoutGrid },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-bold">棚割り管理システム</h1>
            </div>
          </header>
          <nav className="border-b bg-muted/40">
            <div className="container mx-auto px-4">
              <ul className="flex gap-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors rounded-t-lg"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
