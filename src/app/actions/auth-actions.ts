'use server'

import { createClient } from '@supabase/supabase-js'

// Cliente Supabase con rol de servicio (ADMIN)
// Solo usar en el servidor
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function createNewUser(formData: any) {
    const { email, password, full_name, role, phone } = formData

    try {
        // 1. Crear usuario en Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false, // El usuario debe confirmar su correo
            user_metadata: {
                full_name,
                role
            }
        })

        if (authError) throw authError
        if (!authUser.user) throw new Error('No se pudo crear el usuario')

        // Enviar correo de verificación manualmente para asegurar entrega
        // admin.createUser a veces no dispara el correo automáticamente dependiendo de la config
        await supabaseAdmin.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
            }
        })

        // 2. Insertar en tabla public.users
        // Nota: Normalmente esto lo haría un Trigger, pero para asegurar consistencia lo hacemos aquí
        // o dejamos que el trigger 'on_auth_user_created' (si existiera) lo haga.
        // Dado que no tenemos trigger confirmado, lo insertamos manualmente.
        // OJO: Si existe un trigger, esto podría duplicar o fallar. 
        // Vamos a intentar insertar, si falla por duplicado es que el trigger funcionó.

        /* 
           Si tu sistema usa Triggers: No insertes manualmente.
           Si NO usa Triggers: Inserta manualmente.
           
           Asumiremos Inserción Manual para asegurar que los datos extra (role, phone, is_active) queden bien.
           Usaremos 'upsert' para evitar conflictos con triggers.
        */

        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authUser.user.id, // Usar el mismo ID de Auth
                email,
                full_name,
                role,
                is_active: true,
                // phone // Si tu tabla users tiene columna phone
            })

        if (dbError) {
            // Si falla la DB, podríamos querer borrar el usuario de Auth para mantenencia
            // await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
            throw dbError
        }

        return { success: true, user: authUser.user }

    } catch (error: any) {
        console.error('Error creating user:', error)
        return { success: false, error: error.message }
    }
}
