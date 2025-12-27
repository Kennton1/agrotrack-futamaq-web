
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

async function autoConfirmUser() {
    console.log('Searching for unconfirmed user: ignaciouwu72@gmail.com')

    // Find the user ID from public table or auth
    // Note: We can list auth users with admin API

    // Lista de usuarios auth para buscar ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing auth users:', listError)
        return
    }

    const targetUser = users.find(u => u.email === 'ignaciouwu72@gmail.com')

    if (!targetUser) {
        console.error('User not found in Auth system.')
        return
    }

    console.log(`Found Auth User: ${targetUser.id}. Confirmed: ${targetUser.email_confirmed_at}`)

    if (!targetUser.email_confirmed_at) {
        console.log('Confirming email manually...')
        const { data, error } = await supabase.auth.admin.updateUserById(
            targetUser.id,
            { email_confirm: true }
        )
        if (error) {
            console.error('Failed to confirm:', error)
        } else {
            console.log('User confirmed successfully.')
        }
    } else {
        console.log('User is already confirmed.')
    }
}

autoConfirmUser()
