import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: '嘉嘉易学工具箱',
  description:
    '传承国学经典，融合现代科技。提供公农历查询、八字排盘、梅花易数、奇门遁甲、六爻、太乙等专业易学工具。',
  keywords: '易学,八字,排盘,公农历,梅花易数,奇门遁甲,六爻,太乙,择吉,起名',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
