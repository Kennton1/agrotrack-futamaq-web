import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializamos el cliente
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Aquí recibimos qué plan quiere comprar el usuario
        const { planTitle, price, payer_email } = body;
        // Inicializamos la API de Checkouts (Preference - Pago Único)
        const preference = new Preference(client);

        // Determinar URL base y si es entorno local
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

        const preferenceData = {
            body: {
                items: [
                    {
                        id: planTitle.toLowerCase().replace(' ', '-'),
                        title: `Plan ${planTitle} - AgroHosting`,
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'CLP',
                    }
                ],
                payer: {
                    email: payer_email || 'test_user_generic@test.com'
                },
                // URLs de retorno dinámicas
                back_urls: {
                    success: `${baseUrl}/success`,
                    failure: `${baseUrl}/dashboard?payment=failure`,
                    pending: `${baseUrl}/dashboard?payment=pending`,
                },
                // Solo activar auto_return si NO es local (para evitar error 500)
                auto_return: isLocal ? undefined : 'approved',
                binary_mode: true,
            }
        };

        console.log('Enviando preferencia a MP:', JSON.stringify(preferenceData, null, 2));

        const result = await preference.create(preferenceData);

        // Devolvemos la URL de pago (init_point) al frontend
        return NextResponse.json({
            id: result.id,
            url: result.init_point
        });

    } catch (error) {
        console.error('Error creando preferencia MP:', error);
        const errorMessage = (error as any)?.message || 'Error desconocido';
        return NextResponse.json(
            { error: `Error al procesar el pago: ${errorMessage}` },
            { status: 500 }
        );
    }
}
