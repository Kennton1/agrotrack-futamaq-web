/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegurar que las URLs se generen correctamente
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Configuración para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    // Deshabilitar optimizaciones que pueden causar problemas en desarrollo
    reactStrictMode: true,
  }),

  // Configuración de headers para evitar problemas de caché en desarrollo
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
