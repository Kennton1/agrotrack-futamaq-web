
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAddWorkOrderLogic() {
    try {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}${month}${year}`;
        const prefix = `OT-${dateStr}-`;

        console.log(`Checking for IDs with prefix: ${prefix}`);

        const { data: lastConfig, error: idError } = await supabase
            .from('work_orders')
            .select('id')
            .like('id', `${prefix}%`)
            .order('id', { ascending: false })
            .limit(1);

        if (idError) {
            console.error('Error fetching last ID:', idError);
        } else {
            console.log('Last ID found:', lastConfig);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testAddWorkOrderLogic();
