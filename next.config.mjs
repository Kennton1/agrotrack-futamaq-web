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
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
