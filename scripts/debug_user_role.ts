
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

async function debug() {
    console.log('Listing all users...')

    const { data: users, error } = await supabase
        .from('users')
        .select('*')

    if (error) {
        console.error('Select failed:', error)
    } else {
        console.log('Users found (count):', users?.length)
        console.log('Users:', JSON.stringify(users, null, 2))
    }
}

debug()
