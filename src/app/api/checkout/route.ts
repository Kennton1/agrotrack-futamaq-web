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

        // URL Base robusta - COMENTADA: Usando hardcode temporal
        // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

        // Inicializamos la API de Checkouts (Preference - Pago Único)
        // Cambiamos a esto temporalmente porque es más permisivo probando en Sandbox
        const preference = new Preference(client);

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
                // URLs de retorno dinámicas (Prod vs Local)
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard?payment=failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard?payment=pending`,
                },
                auto_return: 'approved', // En PROD funciona perfecto. En Localhost puede fallar, pero es el comportamiento deseado.
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
