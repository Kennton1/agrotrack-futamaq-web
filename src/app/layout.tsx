import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import OfflineIndicator, { SyncIndicator } from "@/components/offline/OfflineIndicator";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import NewAppLayout from "@/components/layout/NewAppLayout";
import ClientOnly from "@/components/common/ClientOnly";
import { AuthDebug } from "@/components/common/AuthDebug";
import { ServiceWorkerManager } from "@/components/common/ServiceWorkerManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgroTrack FUTAMAQ - Sistema de Gestión Agrícola",
  description: "Sistema integral de gestión de maquinaria agrícola, órdenes de trabajo y mantenimientos para FUTAMAQ",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Suprimir errores de hidratación causados por extensiones del navegador
  if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('Extra attributes from the server')) {
        return; // Suprimir errores de hidratación de extensiones
      }
      originalConsoleError.apply(console, args);
    };
  }

  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'light' || storedTheme === 'dark') {
                    document.documentElement.setAttribute('data-theme', storedTheme);
                  } else {
                    // Modo oscuro por defecto para nuevos usuarios
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                  }
                } catch (e) {
                  // Si hay error, usar modo oscuro por defecto
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        <AuthProvider>
          <AppProvider>
            <NewAppLayout>
              {children}
            </NewAppLayout>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                border: '1px solid #374151',
              },
              success: {
                duration: 2500,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
                style: {
                  background: '#1F2937',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  border: '1px solid #374151',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  background: '#1F2937',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  border: '1px solid #374151',
                },
              },
            }}
          />
            <ClientOnly>
              <ServiceWorkerManager />
              <AuthDebug />
              <OfflineIndicator />
              <SyncIndicator />
            </ClientOnly>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
