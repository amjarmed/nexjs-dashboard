import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: '%s | Acme Dashboard',
  description: 'the official dashboard for Acme Inc, built with app router',
  keywords: ['dashboard', 'acme', 'app router'],
  metadataBase: new URL('https://nexjs-dashboard-pied.vercel.app/'),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
