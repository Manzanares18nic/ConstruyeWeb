import type { Metadata } from 'next';
import './globals.css';
import { POSProvider } from '@/context/POSContext';
import { Sidebar } from '@/components/Sidebar';
import { CobroModal } from '@/components/CobroModal';

export const metadata: Metadata = {
  title: 'ConstruyeWeb POS — Sistema de Inventario y Punto de Venta',
  description: 'Panel general, POS y gestión operativa ferretera de ConstruyeWeb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FFF9F5] text-[#1E293B] antialiased flex selection:bg-orange-200">
        <POSProvider>
          <Sidebar />
          <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto max-h-screen">
            {children}
          </main>
          <CobroModal />
        </POSProvider>
      </body>
    </html>
  );
}
