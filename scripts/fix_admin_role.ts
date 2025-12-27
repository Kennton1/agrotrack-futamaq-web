
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        envVars[key.trim()] = value.trim().replace(/"/g, '')
    }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function fixAdmin() {
    console.log('Fixing admin role for kenntonbr@gmail.com...')

    const { data: user, error: findError } = await supabase
        .from('users') // querying public.users
        .select('*')
        .eq('email', 'kenntonbr@gmail.com')
        .single()

    if (findError) {
        console.error('User not found:', findError)
        return
    }

    console.log('Current user:', user)

    const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ role: 'administrador' })
        .eq('id', user.id)
        .select()

    if (updateError) {
        console.error('Update failed:', updateError)
    } else {
        console.log('Update success:', updated)
    }

    // Also try to update auth metadata just in case, though we can't easily do that via public table client without auth admin API.
    // We can use supabase.auth.admin.updateUserById if we had the ID.
    // Let's do that too.

    if (user.id) {
        const { data: authUpdate, error: authError } = await supabase.auth.admin.updateUserById(
            user.id,
            { user_metadata: { role: 'administrador' } }
        )
        if (authError) console.error('Auth update failed:', authError)
        else console.log('Auth metadata updated.')
    }
}

fixAdmin()
