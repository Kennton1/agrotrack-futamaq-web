import MercadoPagoConfig, { Preference } from 'mercadopago';

// Inicializamos el cliente.
// NOTA: 'MERCADOPAGO_ACCESS_TOKEN' debe estar en tu archivo .env.local
// Usa el "Access Token" de "Credenciales de prueba" (empieza con TEST-) para desarrollo.

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

// Exportamos lo necesario para crear preferencias de pago
export const preference = new Preference(client);
