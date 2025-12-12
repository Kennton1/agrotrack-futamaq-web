
const fs = require('fs');
const path = require('path');

// 1. Read mockData.ts
const mockDataPath = path.join(__dirname, '../src/data/mockData.ts');
let mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// 2. Clean up TypeScript to make it valid JS
// Remove imports (multiline support)
mockDataContent = mockDataContent.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
// Remove specific type annotations used in the file
const typesToRemove = ['Machinery', 'WorkOrder', 'Maintenance', 'FuelLoad', 'SparePart', 'PartMovement'];
typesToRemove.forEach(type => {
    // Escaped regex for : Type[]
    const regex = new RegExp(`:\\s*${type}\\[\\]`, 'g');
    mockDataContent = mockDataContent.replace(regex, '');
});

// Explicitly fix getDateString signature
mockDataContent = mockDataContent.replace(/\(daysAgo: number, hour: number = 8\)/, '(daysAgo, hour = 8)');

// Remove "export const" to just let variables be defined (we will eval it)
mockDataContent = mockDataContent.replace(/export\s+const/g, 'const');
// 3. Eval the content to get the objects
// We wrap it in a function to return the data
const evalCode = `
    ${mockDataContent}
    return { 
        MOCK_MACHINERY, 
        MOCK_WORK_ORDERS, 
        MOCK_MAINTENANCES, 
        MOCK_FUEL_LOADS, 
        MOCK_SPARE_PARTS, 
        MOCK_PART_MOVEMENTS 
    };
`;

fs.writeFileSync('debug_eval.js', evalCode);

// Safe eval function
const extractedData = (new Function(evalCode))();

// FIX: Backfill missing 'code' in spare parts
if (extractedData.MOCK_SPARE_PARTS) {
    extractedData.MOCK_SPARE_PARTS = extractedData.MOCK_SPARE_PARTS.map(p => ({
        ...p,
        code: p.code || `REP-${String(p.id).padStart(3, '0')}`
    }));
}

// 4. Hardcoded Data from Analysis and Dashboard
const analysisData = {
    performance: {
        efficiency: 87.5,
        utilization: 92.3,
        productivity: 78.9,
        costEffectiveness: 85.2
    },
    trends: {
        fuelConsumption: [
            { date: '2024-03-01', value: 1200 },
            { date: '2024-03-08', value: 1350 },
            { date: '2024-03-15', value: 1100 },
            { date: '2024-03-22', value: 1400 },
            { date: '2024-03-29', value: 1250 }
        ],
        maintenanceCosts: [
            { date: '2024-03-01', value: 450000 },
            { date: '2024-03-08', value: 520000 },
            { date: '2024-03-15', value: 380000 },
            { date: '2024-03-22', value: 610000 },
            { date: '2024-03-29', value: 490000 }
        ],
        productivity: [
            { date: '2024-03-01', value: 75 },
            { date: '2024-03-08', value: 82 },
            { date: '2024-03-15', value: 78 },
            { date: '2024-03-22', value: 85 },
            { date: '2024-03-29', value: 88 }
        ],
        revenue: [
            { date: '2024-03-01', value: 2500000 },
            { date: '2024-03-08', value: 2800000 },
            { date: '2024-03-15', value: 2600000 },
            { date: '2024-03-22', value: 3000000 },
            { date: '2024-03-29', value: 2900000 }
        ]
    },
    insights: [
        {
            id: 1,
            type: 'warning',
            title: 'Alto Consumo de Combustible',
            description: 'El tractor T002 ha mostrado un consumo 25% superior al promedio',
            impact: 'high',
            recommendation: 'Revisar el sistema de inyección y realizar mantenimiento preventivo'
        },
        {
            id: 2,
            type: 'success',
            title: 'Excelente Eficiencia Operacional',
            description: 'La productividad ha aumentado 15% en el último mes',
            impact: 'high',
            recommendation: 'Mantener las prácticas actuales y considerar replicar en otras áreas'
        },
        {
            id: 3,
            type: 'info',
            title: 'Optimización de Rutas',
            description: 'Se identificaron oportunidades de optimización en las rutas de trabajo',
            impact: 'medium',
            recommendation: 'Implementar sistema de optimización de rutas para reducir tiempos de desplazamiento'
        },
        {
            id: 4,
            type: 'error',
            title: 'Mantenimiento Atrasado',
            description: '3 maquinarias tienen mantenimientos vencidos',
            impact: 'high',
            recommendation: 'Programar mantenimientos urgentes para evitar fallas mayores'
        }
    ],
    predictions: {
        fuelCost: { nextMonth: 1800000, trend: 'up' },
        maintenance: { nextMonth: 650000, trend: 'up' },
        productivity: { nextMonth: 90, trend: 'up' }
    }
};

const dashboardData = {
    fuelConsumptionData: [
        { mes: 'Ene', consumo: 1200, costo: 1500000 },
        { mes: 'Feb', consumo: 1350, costo: 1687500 },
        { mes: 'Mar', consumo: 1100, costo: 1375000 },
        { mes: 'Abr', consumo: 1450, costo: 1812500 },
        { mes: 'May', consumo: 1300, costo: 1625000 },
        { mes: 'Jun', consumo: 1250, costo: 1562500 },
    ],
    maintenanceCostsData: [
        { mes: 'Ene', preventivo: 450000, correctivo: 320000, emergencia: 180000 },
        { mes: 'Feb', preventivo: 520000, correctivo: 280000, emergencia: 150000 },
        { mes: 'Mar', preventivo: 480000, correctivo: 410000, emergencia: 220000 },
        { mes: 'Abr', preventivo: 550000, correctivo: 350000, emergencia: 190000 },
        { mes: 'May', preventivo: 500000, correctivo: 380000, emergencia: 160000 },
        { mes: 'Jun', preventivo: 580000, correctivo: 420000, emergencia: 210000 },
    ],
    machineryUtilizationData: [
        { name: 'Tractores', value: 85, color: '#8ba394' },
        { name: 'Cosechadoras', value: 72, color: '#64748b' },
        { name: 'Sembradoras', value: 68, color: '#78716c' },
        { name: 'Pulverizadores', value: 91, color: '#0ea5e9' },
    ]
};


// 5. HELPER FUNCTIONS FOR SQL GENERATION
function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number') return str;
    if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
    if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
    return `'${String(str).replace(/'/g, "''")}'`;
}

function generateInsert(table, data) {
    if (!data || data.length === 0) return '';
    const keys = Object.keys(data[0]);
    // Filter out keys that might not exist in the DB or need special handling if necessary
    // For now, we assume keys match column names or we map them.

    // MAPPING FIXES based on Schema vs MockData
    // Machinery: last_location is JSONB. Mock has object. JSON.stringify handles it.
    // WorkOrder: assigned_machinery is array of INTs. JSON.stringify -> '[1,2]'. Postgres array string is '{1,2}'.

    const values = data.map(item => {
        const vals = keys.map(key => {
            let val = item[key];

            // SPECIAL HANDLING
            if (key === 'assigned_machinery' && Array.isArray(val)) {
                return `'${JSON.stringify(val).replace('[', '{').replace(']', '}')}'`; // Convert [1,2] to '{1,2}' for Postres array
            }
            if (key === 'photos' && Array.isArray(val)) {
                return val.length > 0 ? `'${JSON.stringify(val).replace('[', '{').replace(']', '}')}'` : 'NULL';
            }
            if (key === 'last_location' || key === 'parts_used' || key === 'items') {
                return `'${JSON.stringify(val)}'`; // JSONB columns
            }
            if (key === 'machinery_brand' || key === 'machinery_model' || key === 'machinery_code') return undefined; // Skip fields not in DB tables

            return escapeSql(val);
        }).filter(v => v !== undefined);
        return `(${vals.join(', ')})`;
    });

    const validKeys = keys.filter(k => k !== 'machinery_brand' && k !== 'machinery_model' && k !== 'machinery_code');

    return `INSERT INTO ${table} (${validKeys.join(', ')}) VALUES\n${values.join(',\n')}\nON CONFLICT DO NOTHING;`;
}

// 6. GENERATE SQL
let sql = `-- GENERATED SEED SCRIPT

-- 1. Ensure system_config table exists (to avoid "relation does not exist" error on TRUNCATE)
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for system_config if not already enabled (idempotent check)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'system_config' 
        AND c.relrowsecurity = true
    ) THEN 
        ALTER TABLE system_config ENABLE ROW LEVEL SECURITY; 
    END IF; 
END $$;

-- Add policy if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_config' AND policyname = 'Users can view system_config'
    ) THEN 
        CREATE POLICY "Users can view system_config" ON system_config FOR SELECT USING (true);
    END IF; 
END $$;



-- Schema Validations / Fixes (Must run BEFORE inserts)
DO $$ 
BEGIN 
    -- Fix fuel_loads columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fuel_loads' AND column_name = 'location') THEN 
        ALTER TABLE fuel_loads ADD COLUMN location VARCHAR(255); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fuel_loads' AND column_name = 'operator') THEN 
        ALTER TABLE fuel_loads ADD COLUMN operator VARCHAR(255); 
    END IF;

    -- Fix maintenances columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenances' AND column_name = 'items') THEN 
        ALTER TABLE maintenances ADD COLUMN items JSONB; 
    END IF;

    -- Fix incidents columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidents' AND column_name = 'severity') THEN 
        ALTER TABLE incidents ADD COLUMN severity VARCHAR(50); 
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidents' AND column_name = 'machinery_id') THEN 
        ALTER TABLE incidents ADD COLUMN machinery_id INTEGER; 
    END IF;

    -- Fix spare_parts columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spare_parts' AND column_name = 'machinery_id') THEN 
        ALTER TABLE spare_parts ADD COLUMN machinery_id INTEGER REFERENCES machinery(id); 
    END IF;
END $$;

-- Cleans tables first
TRUNCATE TABLE 
    incidents, 
    part_movements, 
    spare_parts, 
    fuel_loads, 
    maintenances, 
    daily_reports, 
    work_orders, 
    machinery, 
    clients, 
    users,
    system_config
CASCADE;

-- Re-insert basic users (Fixed IDs to avoid conflicts if any, though we mostly use UUIDs so we let DB handle it or specific emails)
INSERT INTO users (email, full_name, role, is_active) VALUES
('admin@futamaq.cl', 'Carlos Muñoz', 'administrador', true),
('operador1@futamaq.cl', 'Pedro Silva', 'operador', true),
('operador2@futamaq.cl', 'María González', 'operador', true),
('cliente1@losrobles.cl', 'Juan Pérez Soto', 'cliente', true),
('cliente2@coopvaldivia.cl', 'Ana Martínez', 'cliente', true)
ON CONFLICT (email) DO NOTHING;

-- Re-insert basic clients (Explicit IDs to match Work Order references)
INSERT INTO clients (id, name, rut, contact_person, phone, email, address) VALUES
(1, 'Agrícola Los Robles S.A.', '76.123.456-7', 'Juan Pérez Soto', '+56912345678', 'juan.perez@losrobles.cl', 'Ruta 5 Sur Km 765, Los Lagos'),
(2, 'Cooperativa Campesina Valdivia', '65.987.654-3', 'María González', '+56987654321', 'coordinacion@coopvaldivia.cl', 'Camino Rural Los Laureles s/n'),
(3, 'Agrícola San José Ltda.', '78.456.789-2', 'Carlos Rodríguez', '+56945678912', 'carlos@san-jose.cl', 'Camino a Panguipulli Km 12'),
(4, 'Fundo Los Robles', '99.888.777-6', 'Roberto Gomez', '+56987654321', 'roberto@losrobles.cl', 'Ruta 5 Sur Km 800'),
(5, 'Agrícola Santa María', '77.777.666-5', 'Elena Rojas', '+56977766655', 'elena@santamaria.cl', 'Ruta Costera Km 45')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, rut = EXCLUDED.rut; -- Update if exists to ensure ID mapping is correct

-- INSERT MACHINERY
${generateInsert('machinery', extractedData.MOCK_MACHINERY)}

-- INSERT WORK ORDERS
${generateInsert('work_orders', extractedData.MOCK_WORK_ORDERS)}

-- INSERT MAINTENANCES
${generateInsert('maintenances', extractedData.MOCK_MAINTENANCES)}

-- INSERT FUEL LOADS
${generateInsert('fuel_loads', extractedData.MOCK_FUEL_LOADS)}

-- INSERT SPARE PARTS
${generateInsert('spare_parts', extractedData.MOCK_SPARE_PARTS)}

-- INSERT PART MOVEMENTS
${generateInsert('part_movements', extractedData.MOCK_PART_MOVEMENTS)}

-- INSERT ANALYTICS CACHE
INSERT INTO system_config (key, value, description) VALUES
('analisis_dashboard_data', '${JSON.stringify(analysisData)}', 'Cached data for the Analysis Dashboard'),
('main_dashboard_data', '${JSON.stringify(dashboardData)}', 'Cached data for the Main Dashboard')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- PATCH INCIDENTS (We extracted these earlier but let's add them back manually if they were static)
-- Since we are truncating, we should add some incidents back.
INSERT INTO incidents (work_order_id, type, title, description, status, reporter_id, created_at) VALUES 
('OT-2024-001', 'mecanica', 'Falla en sistema hidráulico', 'Se detectó fuga de aceite en manguera principal', 'abierta', 'Pedro Silva', NOW()),
('OT-2024-002', 'climatica', 'Lluvia intensa detiene faena', 'No se puede continuar por condiciones de terreno', 'resuelta', 'María González', NOW() - INTERVAL '2 days');


`;

console.log('Generating seed file...');
fs.writeFileSync('supabase-seed.sql', sql, 'utf8');
console.log('Seed file generated: supabase-seed.sql');
