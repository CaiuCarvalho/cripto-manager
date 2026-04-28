import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cripto Manager',
  description: 'Sistema de gerenciamento de criptoativos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
