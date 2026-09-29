import type { Metadata, Viewport } from 'next';
import './globals.css';
import { OceanBackground } from '@/components/ocean/OceanBackground';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/config/site';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} · 汐`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: { icon: '/school-logo.svg' },
};

export const viewport: Viewport = {
  themeColor: '#191B41',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-motion="on" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <OceanBackground />
        {children}
      </body>
    </html>
  );
}