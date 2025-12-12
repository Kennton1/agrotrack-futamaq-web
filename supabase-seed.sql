-- GENERATED SEED SCRIPT

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
INSERT INTO machinery (id, code, patent, type, brand, model, year, total_hours, status, fuel_capacity, hourly_cost, last_location, created_at) VALUES
(1, 'TR-001', 'ABCD12', 'tractor', 'John Deere', '6120M', 2020, 2450, 'disponible', 200, 45000, '{"lat":-33.4489,"lng":-70.6693,"address":"Parcela 12, Sector Norte"}', '2024-01-15T10:00:00Z'),
(35, 'TR-002', 'EFGH34', 'tractor', 'New Holland', 'T6080', 2019, 2890, 'disponible', 180, 42000, '{"lat":-33.449,"lng":-70.6694,"address":"Bodega Principal"}', '2024-01-20T10:00:00Z'),
(36, 'TR-003', 'IJKL56', 'tractor', 'Case IH', 'Puma 165', 2021, 1850, 'disponible', 220, 48000, '{"lat":-33.4491,"lng":-70.6695,"address":"Campo Central"}', '2024-02-05T10:00:00Z'),
(37, 'TR-004', 'MNOP78', 'tractor', 'Massey Ferguson', 'MF 6713', 2020, 2100, 'disponible', 190, 44000, '{"lat":-33.4492,"lng":-70.6696,"address":"Sector Este"}', '2024-02-10T10:00:00Z'),
(38, 'TR-005', 'QRST56', 'tractor', 'Fendt', '516 Vario', 2022, 1200, 'disponible', 210, 50000, '{"lat":-33.4493,"lng":-70.6697,"address":"Potrero Norte"}', '2024-03-01T10:00:00Z'),
(39, 'TR-006', 'UVWX12', 'tractor', 'Valtra', 'N154', 2021, 1650, 'disponible', 195, 43000, '{"lat":-33.4494,"lng":-70.6698,"address":"Sector Sur"}', '2024-03-15T10:00:00Z'),
(40, 'TR-007', 'YZAB34', 'tractor', 'Claas', 'Axion 850', 2020, 2200, 'disponible', 205, 47000, '{"lat":-33.4495,"lng":-70.6699,"address":"Campo Sur"}', '2024-04-01T10:00:00Z'),
(41, 'TR-008', 'CDEF56', 'tractor', 'Kubota', 'M7-171', 2021, 1500, 'disponible', 175, 40000, '{"lat":-33.4496,"lng":-70.67,"address":"Lote 5"}', '2024-04-10T10:00:00Z'),
(2, 'AR-001', 'AR001', 'implemento', 'Arado de vertedera', 'Estándar', 2021, 890, 'disponible', 0, 12000, '{"lat":-33.449,"lng":-70.6694,"address":"Bodega Principal"}', '2024-02-10T10:00:00Z'),
(3, 'AC-001', 'AC001', 'implemento', 'Arado de cincel', 'Chisel', 2022, 650, 'disponible', 0, 10000, '{"lat":-33.4491,"lng":-70.6695,"address":"Bodega Principal"}', '2024-03-05T10:00:00Z'),
(4, 'RD-001', 'RD001', 'implemento', 'Rastra de discos', 'Estándar', 2021, 1200, 'disponible', 0, 8000, '{"lat":-33.4492,"lng":-70.6696,"address":"Bodega Principal"}', '2024-02-15T10:00:00Z'),
(5, 'RT-001', 'RT001', 'implemento', 'Rastra de dientes', 'Cultivador', 2020, 1500, 'disponible', 0, 7500, '{"lat":-33.4493,"lng":-70.6697,"address":"Bodega Principal"}', '2024-01-20T10:00:00Z'),
(6, 'SB-001', 'SB001', 'implemento', 'Subsolador', 'Profundo', 2022, 450, 'disponible', 0, 15000, '{"lat":-33.4494,"lng":-70.6698,"address":"Bodega Principal"}', '2024-03-10T10:00:00Z'),
(7, 'RL-001', 'RL001', 'implemento', 'Rodillo', 'Compactador', 2021, 800, 'disponible', 0, 6000, '{"lat":-33.4495,"lng":-70.6699,"address":"Bodega Principal"}', '2024-02-20T10:00:00Z'),
(8, 'SG-001', 'SG001', 'sembradora', 'Sembradora de grano fino', 'Trigo/Avena', 2022, 600, 'disponible', 0, 18000, '{"lat":-33.4496,"lng":-70.67,"address":"Bodega Principal"}', '2024-03-15T10:00:00Z'),
(9, 'SP-001', 'SP001', 'sembradora', 'Sembradora de grano grueso', 'Precisión', 2021, 950, 'disponible', 0, 22000, '{"lat":-33.4497,"lng":-70.6701,"address":"Bodega Principal"}', '2024-02-25T10:00:00Z'),
(10, 'SN-001', 'SN001', 'sembradora', 'Sembradora neumática', 'Aire', 2023, 300, 'disponible', 0, 25000, '{"lat":-33.4498,"lng":-70.6702,"address":"Bodega Principal"}', '2024-04-01T10:00:00Z'),
(11, 'PH-001', 'PH001', 'sembradora', 'Plantadora de hortalizas', 'Hortalizas', 2022, 400, 'disponible', 0, 20000, '{"lat":-33.4499,"lng":-70.6703,"address":"Bodega Principal"}', '2024-03-20T10:00:00Z'),
(12, 'TR-002', 'TR002', 'sembradora', 'Trasplantadora', 'Plantines', 2021, 350, 'disponible', 0, 19000, '{"lat":-33.45,"lng":-70.6704,"address":"Bodega Principal"}', '2024-02-28T10:00:00Z'),
(13, 'AB-001', 'AB001', 'implemento', 'Abonadora', 'Fertilizadora sólidos', 2022, 700, 'disponible', 0, 14000, '{"lat":-33.4501,"lng":-70.6705,"address":"Bodega Principal"}', '2024-03-25T10:00:00Z'),
(14, 'CT-001', 'CT001', 'implemento', 'Cisterna fertilizador', 'Líquidos', 2021, 850, 'disponible', 500, 16000, '{"lat":-33.4502,"lng":-70.6706,"address":"Bodega Principal"}', '2024-03-01T10:00:00Z'),
(15, 'PA-001', 'PA001', 'pulverizador', 'Pulverizadora de arrastre', 'Arrastre', 2022, 1100, 'disponible', 300, 28000, '{"lat":-33.4503,"lng":-70.6707,"address":"Bodega Principal"}', '2024-03-30T10:00:00Z'),
(16, 'PU-001', 'PU001', 'pulverizador', 'Pulverizadora autopropulsada', 'Auto', 2023, 200, 'disponible', 400, 45000, '{"lat":-33.4504,"lng":-70.6708,"address":"Bodega Principal"}', '2024-04-05T10:00:00Z'),
(17, 'CE-001', 'CE001', 'implemento', 'Cultivador entre líneas', 'Interlíneas', 2022, 750, 'disponible', 0, 11000, '{"lat":-33.4505,"lng":-70.6709,"address":"Bodega Principal"}', '2024-04-10T10:00:00Z'),
(18, 'DM-001', 'DM001', 'implemento', 'Desmalezadora', 'Motoguadaña', 2021, 500, 'disponible', 0, 5000, '{"lat":-33.4506,"lng":-70.671,"address":"Bodega Principal"}', '2024-04-15T10:00:00Z'),
(19, 'CC-001', 'CC001', 'implemento', 'Cortacésped agrícola', 'Rotativa', 2022, 600, 'disponible', 0, 7000, '{"lat":-33.4507,"lng":-70.6711,"address":"Bodega Principal"}', '2024-04-20T10:00:00Z'),
(20, 'RP-001', 'RP001', 'implemento', 'Riego por pivote central', 'Pivote', 2020, 2000, 'disponible', 0, 30000, '{"lat":-33.4508,"lng":-70.6712,"address":"Campo Central"}', '2024-01-10T10:00:00Z'),
(21, 'RA-001', 'RA001', 'implemento', 'Riego por aspersión', 'Cañones', 2021, 1500, 'disponible', 0, 25000, '{"lat":-33.4509,"lng":-70.6713,"address":"Campo Norte"}', '2024-02-05T10:00:00Z'),
(22, 'RG-001', 'RG001', 'implemento', 'Sistema de riego por goteo', 'Goteo', 2022, 800, 'disponible', 0, 20000, '{"lat":-33.451,"lng":-70.6714,"address":"Campo Sur"}', '2024-03-12T10:00:00Z'),
(23, 'CG-001', 'CG001', 'cosechadora', 'Cosechadora de granos', 'Combine', 2019, 3200, 'en_mantencion', 600, 85000, '{"lat":-33.4488,"lng":-70.6692,"address":"Taller Central"}', '2023-11-20T10:00:00Z'),
(24, 'CM-001', 'CM001', 'cosechadora', 'Cabezal maicero', 'Maíz', 2021, 1200, 'disponible', 0, 35000, '{"lat":-33.4511,"lng":-70.6715,"address":"Bodega Principal"}', '2024-02-12T10:00:00Z'),
(25, 'CS-001', 'CS001', 'cosechadora', 'Cabezal sojero', 'Cerealero', 2021, 1400, 'disponible', 0, 32000, '{"lat":-33.4512,"lng":-70.6716,"address":"Bodega Principal"}', '2024-02-18T10:00:00Z'),
(26, 'CA-001', 'CA001', 'cosechadora', 'Cosechadora de algodón', 'Algodón', 2020, 1800, 'disponible', 500, 75000, '{"lat":-33.4513,"lng":-70.6717,"address":"Bodega Principal"}', '2024-01-25T10:00:00Z'),
(27, 'CC-002', 'CC002', 'cosechadora', 'Cosechadora de caña de azúcar', 'Caña', 2019, 2500, 'disponible', 550, 80000, '{"lat":-33.4514,"lng":-70.6718,"address":"Bodega Principal"}', '2023-12-10T10:00:00Z'),
(28, 'CP-001', 'CP001', 'cosechadora', 'Cosechadora de papa', 'Tubérculos', 2022, 600, 'disponible', 200, 60000, '{"lat":-33.4515,"lng":-70.6719,"address":"Bodega Principal"}', '2024-03-18T10:00:00Z'),
(29, 'CF-001', 'CF001', 'cosechadora', 'Cosechadora de forraje', 'Picadora', 2021, 1000, 'disponible', 400, 55000, '{"lat":-33.4516,"lng":-70.672,"address":"Bodega Principal"}', '2024-02-22T10:00:00Z'),
(30, 'SB-002', 'SB002', 'implemento', 'Segadora de barras', 'Discos', 2022, 700, 'disponible', 0, 13000, '{"lat":-33.4517,"lng":-70.6721,"address":"Bodega Principal"}', '2024-03-28T10:00:00Z'),
(31, 'AH-001', 'AH001', 'implemento', 'Acondicionadora de heno', 'Heno', 2021, 550, 'disponible', 0, 9000, '{"lat":-33.4518,"lng":-70.6722,"address":"Bodega Principal"}', '2024-04-08T10:00:00Z'),
(32, 'HL-001', 'HL001', 'implemento', 'Hileradora', 'Rastrillo hilerador', 2022, 650, 'disponible', 0, 10000, '{"lat":-33.4519,"lng":-70.6723,"address":"Bodega Principal"}', '2024-04-12T10:00:00Z'),
(33, 'EM-001', 'EM001', 'implemento', 'Embaladora', 'Empacadora', 2021, 900, 'disponible', 0, 17000, '{"lat":-33.452,"lng":-70.6724,"address":"Bodega Principal"}', '2024-03-05T10:00:00Z'),
(34, 'CM-002', 'QRST90', 'camion', 'Mercedes-Benz', 'Atego 1724', 2020, 1850, 'disponible', 150, 38000, '{"lat":-33.4487,"lng":-70.6691,"address":"Parcela 5, Sector Este"}', '2024-01-20T10:00:00Z')
ON CONFLICT DO NOTHING;

-- INSERT WORK ORDERS
INSERT INTO work_orders (id, client_id, field_name, task_type, description, priority, planned_start_date, planned_end_date, actual_start_date, actual_end_date, status, assigned_operator, assigned_machinery, target_hectares, target_hours, actual_hectares, actual_hours, progress_percentage, created_at, updated_at) VALUES
('OT-2024-001', 1, 'Potrero Norte', 'Siembra', 'Siembra de trigo en Potrero Norte. Aplicación de fertilizante previo.', 'alta', '2024-07-15T08:00:00Z', '2024-07-18T18:00:00Z', '2024-07-15T08:30:00Z', NULL, 'en_ejecucion', 'Juan Pérez', '{1,4}', 25, 32, 15, 18, 60, '2024-07-10T10:00:00Z', '2024-07-16T14:30:00Z'),
('OT-2024-002', 2, 'Parcela A', 'Cosecha', 'Cosecha de maíz en Parcela A. Transporte a silo principal.', 'critica', '2024-08-20T07:00:00Z', '2024-08-22T20:00:00Z', NULL, NULL, 'planificada', 'Carlos Rodríguez', '{3,5}', 30, 40, 0, 0, 0, '2024-08-12T10:00:00Z', '2024-08-12T10:00:00Z'),
('OT-2024-003', 1, 'Lote 5', 'Pulverización', 'Aplicación de herbicida post-emergencia en Lote 5.', 'media', '2024-06-14T09:00:00Z', '2024-06-14T17:00:00Z', '2024-06-14T09:15:00Z', '2024-06-14T16:45:00Z', 'completada', 'María González', '{2}', 18, 8, 18, 7.5, 100, '2024-06-08T10:00:00Z', '2024-06-14T16:45:00Z'),
('OT-2024-004', 3, 'Campo Los Ríos', 'Preparación de suelo', 'Arado y rastraje de Campo Los Ríos para preparación de siembra de soja.', 'alta', '2024-05-10T07:00:00Z', '2024-05-12T18:00:00Z', '2024-05-10T07:30:00Z', '2024-05-12T17:00:00Z', 'completada', 'Pedro Martínez', '{1,4}', 35, 48, 35, 46, 100, '2024-05-05T10:00:00Z', '2024-05-12T17:00:00Z'),
('OT-2024-005', 4, 'Hacienda Principal', 'Fertilización', 'Aplicación de fertilizante nitrogenado en Hacienda Principal, sector este.', 'media', '2024-07-16T08:00:00Z', '2024-07-16T16:00:00Z', '2024-07-16T08:15:00Z', '2024-07-16T15:30:00Z', 'completada', 'Ana López', '{2}', 22, 8, 22, 7.25, 100, '2024-07-11T10:00:00Z', '2024-07-16T15:30:00Z'),
('OT-2024-006', 2, 'Sector Oeste', 'Siembra', 'Siembra de girasol en Sector Oeste. Aplicación de semilla certificada.', 'alta', '2024-09-19T07:00:00Z', '2024-09-21T18:00:00Z', '2024-09-19T07:20:00Z', NULL, 'en_ejecucion', 'Luis Fernández', '{1,4}', 28, 36, 12, 15, 43, '2024-09-13T10:00:00Z', '2024-09-20T14:00:00Z'),
('OT-2024-007', 5, 'Potrero Industrial', 'Cosecha', 'Cosecha de trigo en Potrero Industrial. Transporte a molino asociado.', 'critica', '2024-08-18T06:00:00Z', '2024-08-20T20:00:00Z', '2024-08-18T06:30:00Z', NULL, 'en_ejecucion', 'Roberto Sánchez', '{3,5}', 42, 60, 28, 38, 67, '2024-08-10T10:00:00Z', '2024-08-19T16:30:00Z'),
('OT-2024-008', 1, 'Sector Este', 'Pulverización', 'Aplicación de insecticida para control de plagas en Sector Este.', 'alta', '2024-06-13T09:00:00Z', '2024-06-13T17:00:00Z', NULL, NULL, 'retrasada', 'María González', '{2}', 20, 8, 0, 0, 0, '2024-06-08T10:00:00Z', '2024-06-13T18:00:00Z'),
('OT-2024-009', 3, 'Potrero 1', 'Riego', 'Instalación y activación de sistema de riego por aspersión en Potrero 1.', 'media', '2024-08-17T08:00:00Z', '2024-08-19T18:00:00Z', NULL, NULL, 'retrasada', 'Carlos Rodríguez', '{5}', 30, 40, 0, 0, 0, '2024-08-12T10:00:00Z', '2024-08-19T10:00:00Z'),
('OT-2024-010', 4, 'Campo Nuevo', 'Siembra', 'Siembra de maíz híbrido en Campo Nuevo, sector central.', 'alta', '2024-09-22T07:00:00Z', '2024-09-24T18:00:00Z', NULL, NULL, 'planificada', 'Juan Pérez', '{1,4}', 32, 40, 0, 0, 0, '2024-09-15T10:00:00Z', '2024-09-15T10:00:00Z'),
('OT-2024-011', 2, 'Lote 12', 'Preparación de suelo', 'Arado profundo en Lote 12 para renovación de suelo.', 'media', '2024-05-25T07:00:00Z', '2024-05-27T18:00:00Z', NULL, NULL, 'planificada', 'Pedro Martínez', '{1}', 25, 36, 0, 0, 0, '2024-05-16T10:00:00Z', '2024-05-16T10:00:00Z'),
('OT-2024-012', 5, 'Campo Sur', 'Cosecha', 'Cosecha de cebada en Campo Sur. Secado y almacenamiento.', 'critica', '2024-06-11T06:00:00Z', '2024-06-13T20:00:00Z', '2024-06-11T06:15:00Z', '2024-06-13T19:30:00Z', 'completada', 'Roberto Sánchez', '{3,5}', 38, 56, 38, 54, 100, '2024-06-05T10:00:00Z', '2024-06-13T19:30:00Z'),
('OT-2024-013', 1, 'Campo Central', 'Pulverización', 'Aplicación preventiva de fungicida en Campo Central para control de enfermedades.', 'alta', '2024-07-12T09:00:00Z', '2024-07-12T17:00:00Z', '2024-07-12T09:10:00Z', '2024-07-12T16:50:00Z', 'completada', 'Ana López', '{2}', 19, 8, 19, 7.67, 100, '2024-07-07T10:00:00Z', '2024-07-12T16:50:00Z'),
('OT-2024-014', 3, 'Sector Norte', 'Siembra', 'Siembra de avena forrajera en Sector Norte.', 'media', '2024-08-21T07:00:00Z', '2024-08-23T18:00:00Z', '2024-08-21T07:25:00Z', NULL, 'en_ejecucion', 'Luis Fernández', '{1,4}', 26, 32, 8, 10, 31, '2024-08-14T10:00:00Z', '2024-08-21T15:00:00Z'),
('OT-2024-015', 4, 'Sector Sur', 'Desmalezado', 'Desmalezado mecánico en Sector Sur para control de malezas.', 'baja', '2024-05-09T08:00:00Z', '2024-05-10T18:00:00Z', '2024-05-09T08:30:00Z', '2024-05-10T17:15:00Z', 'completada', 'Pedro Martínez', '{1}', 15, 20, 15, 18.75, 100, '2024-05-04T10:00:00Z', '2024-05-10T17:15:00Z'),
('OT-2024-016', 2, 'Parcela B', 'Pulverización', 'Aplicación de herbicida pre-emergente en Parcela B antes de siembra.', 'alta', '2024-09-17T09:00:00Z', '2024-09-17T17:00:00Z', NULL, NULL, 'retrasada', 'María González', '{2}', 24, 8, 0, 0, 0, '2024-09-11T10:00:00Z', '2024-09-17T18:00:00Z'),
('OT-2024-017', 5, 'Lote 20', 'Cosecha', 'Cosecha de girasol en Lote 20. Procesamiento y almacenamiento.', 'critica', '2024-08-26T06:00:00Z', '2024-08-28T20:00:00Z', NULL, NULL, 'planificada', 'Roberto Sánchez', '{3,5}', 40, 64, 0, 0, 0, '2024-08-17T10:00:00Z', '2024-08-17T10:00:00Z'),
('OT-2024-018', 1, 'Potrero Sur', 'Fertilización', 'Aplicación de fertilizante foliar en Potrero Sur para mejorar rendimiento.', 'media', '2024-07-15T08:00:00Z', '2024-07-15T16:00:00Z', '2024-07-15T08:20:00Z', '2024-07-15T15:40:00Z', 'completada', 'Ana López', '{2}', 21, 8, 21, 7.33, 100, '2024-07-09T10:00:00Z', '2024-07-15T15:40:00Z')
ON CONFLICT DO NOTHING;

-- INSERT MAINTENANCES
INSERT INTO maintenances (id, machinery_id, type, status, scheduled_date, completion_date, description, cost, items, parts_used, technician, odometer_hours, created_at) VALUES
(1, 3, 'preventiva', 'en_ejecucion', '2024-08-15T08:00:00Z', NULL, 'Mantenimiento preventivo 3000 horas. Cambio de aceite, filtros y revisión general.', 123000, '[{"id":"MI-001","name":"Cambio de aceite motor","description":"Cambio de aceite del motor principal","type":"cambio_aceite","cost":45000,"estimated_hours":2,"actual_hours":1.5,"status":"completado","notes":"Aceite 15W-40 sintético","parts_required":["Aceite Motor 15W40","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-08-15","completed_date":"2024-08-15","assigned_technician":"Roberto Silva"},{"id":"MI-002","name":"Cambio de filtros","description":"Reemplazo de filtros de aire y combustible","type":"cambio_filtros","cost":38000,"estimated_hours":1,"status":"en_progreso","notes":"Filtros muy sucios por polvo","parts_required":["Filtro de Aire","Filtro de Combustible"],"priority":"media","scheduled_date":"2024-08-15","assigned_technician":"Roberto Silva"},{"id":"MI-003","name":"Inspección general","description":"Revisión completa del sistema","type":"inspeccion","cost":40000,"estimated_hours":2,"status":"pendiente","notes":"Revisar sistema hidráulico y transmisión","parts_required":[],"priority":"media","scheduled_date":"2024-08-15","assigned_technician":"Roberto Silva"}]', '[{"part":"Aceite Motor 15W40","quantity":25},{"part":"Filtro de Aceite","quantity":1},{"part":"Filtro de Aire","quantity":1}]', 'Roberto Silva', 3200, '2024-08-10T10:00:00Z'),
(2, 1, 'preventiva', 'programada', '2024-09-25T08:00:00Z', NULL, 'Mantenimiento preventivo 2500 horas. Revisión de sistema hidráulico.', 95000, '[{"id":"MI-004","name":"Cambio de aceite motor","description":"Cambio de aceite del motor principal","type":"cambio_aceite","cost":45000,"estimated_hours":2,"status":"pendiente","notes":"Aceite 15W-40","parts_required":["Aceite Motor 15W40","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-09-25","assigned_technician":"Roberto Silva"},{"id":"MI-005","name":"Cambio de correas","description":"Reemplazo de correas de transmisión","type":"cambio_correas","cost":50000,"estimated_hours":3,"status":"pendiente","notes":"Correas con desgaste normal","parts_required":["Correa Transmisión","Correa Alternador"],"priority":"media","scheduled_date":"2024-09-25","assigned_technician":"Roberto Silva"}]', '[]', 'Roberto Silva', 2450, '2024-09-05T10:00:00Z'),
(3, 2, 'correctiva', 'completada', '2024-06-10T08:00:00Z', '2024-06-12T16:00:00Z', 'Reparación de sistema de transmisión. Cambio de correas y ajuste de embrague.', 450000, '[{"id":"MI-006","name":"Cambio de correas de transmisión","description":"Reemplazo completo de correas de transmisión","type":"cambio_correas","cost":280000,"estimated_hours":4,"actual_hours":3.5,"status":"completado","notes":"Correas desgastadas por uso intensivo","parts_required":["Correas Transmisión"],"priority":"alta","scheduled_date":"2024-06-10","completed_date":"2024-06-11","assigned_technician":"Roberto Silva"},{"id":"MI-007","name":"Ajuste de embrague","description":"Ajuste y reparación del sistema de embrague","type":"ajuste","cost":170000,"estimated_hours":3,"actual_hours":2.5,"status":"completado","notes":"Kit embrague reemplazado","parts_required":["Kit Embrague"],"priority":"alta","scheduled_date":"2024-06-10","completed_date":"2024-06-12","assigned_technician":"Roberto Silva"}]', '[{"part":"Correas Transmisión","quantity":3},{"part":"Kit Embrague","quantity":1}]', 'Roberto Silva', 1890, '2024-06-08T10:00:00Z'),
(4, 4, 'preventiva', 'completada', '2024-06-20T08:00:00Z', '2024-06-20T14:00:00Z', 'Mantenimiento preventivo 500 horas. Lubricación y ajustes generales.', 65000, '[{"id":"MI-008","name":"Lubricación general","description":"Lubricación de todos los puntos de engrase","type":"limpieza","cost":25000,"estimated_hours":1,"actual_hours":0.75,"status":"completado","notes":"Grasa de alta calidad aplicada","parts_required":["Grasa Multipropósito"],"priority":"media","scheduled_date":"2024-06-20","completed_date":"2024-06-20","assigned_technician":"Carlos Méndez"},{"id":"MI-009","name":"Ajuste de cuchillas","description":"Ajuste y afilado de cuchillas","type":"ajuste","cost":40000,"estimated_hours":2,"actual_hours":1.5,"status":"completado","notes":"Cuchillas en buen estado","parts_required":[],"priority":"media","scheduled_date":"2024-06-20","completed_date":"2024-06-20","assigned_technician":"Carlos Méndez"}]', '[{"part":"Grasa Multipropósito","quantity":2}]', 'Carlos Méndez', 450, '2024-06-15T10:00:00Z'),
(5, 5, 'preventiva', 'programada', '2024-08-05T08:00:00Z', NULL, 'Mantenimiento preventivo 2000 horas. Cambio de aceite y revisión de frenos.', 180000, '[{"id":"MI-010","name":"Cambio de aceite motor","description":"Cambio de aceite del motor","type":"cambio_aceite","cost":60000,"estimated_hours":1.5,"status":"pendiente","notes":"Aceite 10W-30","parts_required":["Aceite Motor 10W30","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-08-05","assigned_technician":"Pedro Ramírez"},{"id":"MI-011","name":"Revisión de frenos","description":"Inspección y ajuste del sistema de frenos","type":"inspeccion","cost":50000,"estimated_hours":2,"status":"pendiente","notes":"Revisar pastillas y discos","parts_required":[],"priority":"alta","scheduled_date":"2024-08-05","assigned_technician":"Pedro Ramírez"},{"id":"MI-012","name":"Cambio de filtros","description":"Reemplazo de filtros de aire y combustible","type":"cambio_filtros","cost":70000,"estimated_hours":1,"status":"pendiente","notes":"Filtros estándar","parts_required":["Filtro de Aire","Filtro de Combustible"],"priority":"media","scheduled_date":"2024-08-05","assigned_technician":"Pedro Ramírez"}]', '[]', 'Pedro Ramírez', 1850, '2024-07-20T10:00:00Z'),
(6, 1, 'correctiva', 'completada', '2024-06-10T08:00:00Z', '2024-06-12T16:00:00Z', 'Reparación de sistema hidráulico. Fuga en mangueras principales.', 320000, '[{"id":"MI-013","name":"Reemplazo de mangueras hidráulicas","description":"Cambio de mangueras principales del sistema hidráulico","type":"otro","cost":220000,"estimated_hours":4,"actual_hours":3.5,"status":"completado","notes":"Mangueras de alta presión","parts_required":["Mangueras Hidráulicas","Abrazaderas"],"priority":"critica","scheduled_date":"2024-06-10","completed_date":"2024-06-11","assigned_technician":"Roberto Silva"},{"id":"MI-014","name":"Limpieza del sistema","description":"Limpieza y purga del sistema hidráulico","type":"limpieza","cost":100000,"estimated_hours":2,"actual_hours":1.5,"status":"completado","notes":"Aceite hidráulico reemplazado","parts_required":["Aceite Hidráulico"],"priority":"alta","scheduled_date":"2024-06-10","completed_date":"2024-06-12","assigned_technician":"Roberto Silva"}]', '[{"part":"Mangueras Hidráulicas","quantity":4},{"part":"Abrazaderas","quantity":8},{"part":"Aceite Hidráulico","quantity":20}]', 'Roberto Silva', 2300, '2024-06-05T10:00:00Z'),
(7, 2, 'preventiva', 'en_ejecucion', '2024-08-18T08:00:00Z', NULL, 'Mantenimiento preventivo 2000 horas. Cambio de aceite y filtros.', 110000, '[{"id":"MI-015","name":"Cambio de aceite motor","description":"Cambio de aceite del motor principal","type":"cambio_aceite","cost":50000,"estimated_hours":2,"actual_hours":1.5,"status":"completado","notes":"Aceite 15W-40","parts_required":["Aceite Motor 15W40","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-08-18","completed_date":"2024-08-18","assigned_technician":"Carlos Méndez"},{"id":"MI-016","name":"Cambio de filtros","description":"Reemplazo de filtros de aire y combustible","type":"cambio_filtros","cost":60000,"estimated_hours":1,"status":"en_progreso","notes":"Filtros nuevos instalados","parts_required":["Filtro de Aire","Filtro de Combustible"],"priority":"media","scheduled_date":"2024-08-18","assigned_technician":"Carlos Méndez"}]', '[{"part":"Aceite Motor 15W40","quantity":20},{"part":"Filtro de Aceite","quantity":1},{"part":"Filtro de Aire","quantity":1}]', 'Carlos Méndez', 1950, '2024-08-12T10:00:00Z'),
(8, 3, 'preventiva', 'completada', '2024-05-15T08:00:00Z', '2024-05-17T18:00:00Z', 'Mantenimiento preventivo 3000 horas. Revisión completa del sistema de cosecha.', 280000, '[{"id":"MI-017","name":"Cambio de aceite motor","description":"Cambio de aceite del motor principal","type":"cambio_aceite","cost":120000,"estimated_hours":3,"actual_hours":2.5,"status":"completado","notes":"Aceite 15W-40 para motor grande","parts_required":["Aceite Motor 15W40","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-05-15","completed_date":"2024-05-15","assigned_technician":"Roberto Silva"},{"id":"MI-018","name":"Revisión de sistema de trilla","description":"Inspección y ajuste del sistema de trilla","type":"inspeccion","cost":80000,"estimated_hours":4,"actual_hours":3.5,"status":"completado","notes":"Sistema en buen estado","parts_required":[],"priority":"media","scheduled_date":"2024-05-15","completed_date":"2024-05-16","assigned_technician":"Roberto Silva"},{"id":"MI-019","name":"Limpieza de cabezal","description":"Limpieza profunda del cabezal de cosecha","type":"limpieza","cost":80000,"estimated_hours":3,"actual_hours":2.5,"status":"completado","notes":"Cabezal muy sucio por uso intensivo","parts_required":[],"priority":"media","scheduled_date":"2024-05-15","completed_date":"2024-05-17","assigned_technician":"Roberto Silva"}]', '[{"part":"Aceite Motor 15W40","quantity":40},{"part":"Filtro de Aceite","quantity":1}]', 'Roberto Silva', 3000, '2024-05-10T10:00:00Z'),
(9, 4, 'correctiva', 'completada', '2024-05-05T08:00:00Z', '2024-05-06T14:00:00Z', 'Reparación de sistema de corte. Reemplazo de cuchillas dañadas.', 150000, '[{"id":"MI-020","name":"Reemplazo de cuchillas","description":"Cambio de cuchillas dañadas","type":"otro","cost":100000,"estimated_hours":3,"actual_hours":2.5,"status":"completado","notes":"Cuchillas nuevas instaladas","parts_required":["Cuchillas de Corte"],"priority":"alta","scheduled_date":"2024-05-05","completed_date":"2024-05-05","assigned_technician":"Carlos Méndez"},{"id":"MI-021","name":"Ajuste de sistema","description":"Ajuste y calibración del sistema de corte","type":"ajuste","cost":50000,"estimated_hours":2,"actual_hours":1.5,"status":"completado","notes":"Sistema calibrado correctamente","parts_required":[],"priority":"media","scheduled_date":"2024-05-05","completed_date":"2024-05-06","assigned_technician":"Carlos Méndez"}]', '[{"part":"Cuchillas de Corte","quantity":12}]', 'Carlos Méndez', 400, '2024-05-01T10:00:00Z'),
(10, 1, 'preventiva', 'programada', '2024-09-10T08:00:00Z', NULL, 'Mantenimiento preventivo 3000 horas. Revisión completa del sistema.', 200000, '[{"id":"MI-022","name":"Cambio de aceite motor","description":"Cambio de aceite del motor principal","type":"cambio_aceite","cost":50000,"estimated_hours":2,"status":"pendiente","notes":"Aceite 15W-40","parts_required":["Aceite Motor 15W40","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-09-10","assigned_technician":"Roberto Silva"},{"id":"MI-023","name":"Cambio de correas","description":"Reemplazo preventivo de correas","type":"cambio_correas","cost":80000,"estimated_hours":3,"status":"pendiente","notes":"Correas preventivas","parts_required":["Correa Transmisión","Correa Alternador"],"priority":"media","scheduled_date":"2024-09-10","assigned_technician":"Roberto Silva"},{"id":"MI-024","name":"Inspección general","description":"Revisión completa del sistema","type":"inspeccion","cost":70000,"estimated_hours":3,"status":"pendiente","notes":"Revisión exhaustiva","parts_required":[],"priority":"media","scheduled_date":"2024-09-10","assigned_technician":"Roberto Silva"}]', '[]', 'Roberto Silva', 2400, '2024-08-01T10:00:00Z'),
(11, 5, 'correctiva', 'completada', '2024-06-25T08:00:00Z', '2024-06-26T16:00:00Z', 'Reparación de sistema de frenos. Reemplazo de pastillas y discos.', 250000, '[{"id":"MI-025","name":"Reemplazo de pastillas de freno","description":"Cambio de pastillas delanteras y traseras","type":"otro","cost":150000,"estimated_hours":3,"actual_hours":2.5,"status":"completado","notes":"Pastillas de alta calidad","parts_required":["Pastillas Freno Delanteras","Pastillas Freno Traseras"],"priority":"critica","scheduled_date":"2024-06-25","completed_date":"2024-06-25","assigned_technician":"Pedro Ramírez"},{"id":"MI-026","name":"Rectificado de discos","description":"Rectificado de discos de freno","type":"ajuste","cost":100000,"estimated_hours":2,"actual_hours":1.5,"status":"completado","notes":"Discos en buen estado","parts_required":[],"priority":"alta","scheduled_date":"2024-06-25","completed_date":"2024-06-26","assigned_technician":"Pedro Ramírez"}]', '[{"part":"Pastillas Freno Delanteras","quantity":4},{"part":"Pastillas Freno Traseras","quantity":4}]', 'Pedro Ramírez', 1700, '2024-06-20T10:00:00Z'),
(12, 2, 'preventiva', 'programada', '2024-08-15T08:00:00Z', NULL, 'Mantenimiento preventivo 2500 horas. Cambio de aceite y filtros.', 105000, '[{"id":"MI-027","name":"Cambio de aceite motor","description":"Cambio de aceite del motor principal","type":"cambio_aceite","cost":50000,"estimated_hours":2,"status":"pendiente","notes":"Aceite 15W-40","parts_required":["Aceite Motor 15W40","Filtro de Aceite"],"priority":"alta","scheduled_date":"2024-08-15","assigned_technician":"Carlos Méndez"},{"id":"MI-028","name":"Cambio de filtros","description":"Reemplazo de filtros de aire y combustible","type":"cambio_filtros","cost":55000,"estimated_hours":1,"status":"pendiente","notes":"Filtros estándar","parts_required":["Filtro de Aire","Filtro de Combustible"],"priority":"media","scheduled_date":"2024-08-15","assigned_technician":"Carlos Méndez"}]', '[]', 'Carlos Méndez', 1900, '2024-08-01T10:00:00Z')
ON CONFLICT DO NOTHING;

-- INSERT FUEL LOADS
INSERT INTO fuel_loads (id, machinery_id, operator_id, operator, date, liters, cost_per_liter, total_cost, work_order_id, source, location, created_at) VALUES
(1, 1, 'OP-001', 'Juan Pérez', '2025-12-11T11:00:00.000Z', 150, 1280, 192000, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-12-11T11:00:00.000Z'),
(2, 2, 'OP-002', 'María González', '2025-12-10T12:00:00.000Z', 120, 1300, 156000, 'OT-2024-003', 'bodega', 'Parcela 8, Sector Sur', '2025-12-10T12:00:00.000Z'),
(3, 5, 'OP-003', 'Carlos Rodríguez', '2025-12-09T17:00:00.000Z', 100, 1320, 132000, NULL, 'estacion', 'Estación Shell, Ruta 5', '2025-12-09T17:00:00.000Z'),
(4, 1, 'OP-001', 'Juan Pérez', '2025-12-08T10:00:00.000Z', 180, 1270, 228600, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-12-08T10:00:00.000Z'),
(5, 2, 'OP-004', 'Pedro Martínez', '2025-12-07T13:00:00.000Z', 140, 1290, 180600, 'OT-2024-002', 'bodega', 'Parcela 8, Sector Sur', '2025-12-07T13:00:00.000Z'),
(6, 5, 'OP-003', 'Carlos Rodríguez', '2025-12-06T18:00:00.000Z', 90, 1330, 119700, NULL, 'estacion', 'Estación Copec, Valdivia', '2025-12-06T18:00:00.000Z'),
(7, 1, 'OP-001', 'Juan Pérez', '2025-12-05T11:00:00.000Z', 160, 1300, 208000, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-12-05T11:00:00.000Z'),
(8, 2, 'OP-002', 'María González', '2025-12-03T12:00:00.000Z', 130, 1285, 167050, 'OT-2024-003', 'bodega', 'Parcela 8, Sector Sur', '2025-12-03T12:00:00.000Z'),
(9, 5, 'OP-005', 'Ana López', '2025-12-02T14:00:00.000Z', 110, 1315, 144650, NULL, 'estacion', 'Estación Shell, Ruta 5', '2025-12-02T14:00:00.000Z'),
(10, 1, 'OP-001', 'Juan Pérez', '2025-12-01T10:00:00.000Z', 170, 1260, 214200, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-12-01T10:00:00.000Z'),
(11, 2, 'OP-004', 'Pedro Martínez', '2025-11-29T16:00:00.000Z', 125, 1300, 162500, 'OT-2024-002', 'bodega', 'Parcela 8, Sector Sur', '2025-11-29T16:00:00.000Z'),
(12, 5, 'OP-003', 'Carlos Rodríguez', '2025-11-27T19:00:00.000Z', 95, 1340, 127300, NULL, 'estacion', 'Estación Copec, Valdivia', '2025-11-27T19:00:00.000Z'),
(13, 1, 'OP-001', 'Juan Pérez', '2025-11-26T11:00:00.000Z', 155, 1275, 197625, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-11-26T11:00:00.000Z'),
(14, 2, 'OP-002', 'María González', '2025-11-23T13:00:00.000Z', 135, 1295, 174825, 'OT-2024-003', 'bodega', 'Parcela 8, Sector Sur', '2025-11-23T13:00:00.000Z'),
(15, 5, 'OP-005', 'Ana López', '2025-11-21T15:00:00.000Z', 105, 1325, 139125, NULL, 'estacion', 'Estación Shell, Ruta 5', '2025-11-21T15:00:00.000Z'),
(16, 1, 'OP-001', 'Juan Pérez', '2025-11-19T10:00:00.000Z', 175, 1280, 224000, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-11-19T10:00:00.000Z'),
(17, 2, 'OP-004', 'Pedro Martínez', '2025-11-16T17:00:00.000Z', 145, 1305, 189225, 'OT-2024-002', 'bodega', 'Parcela 8, Sector Sur', '2025-11-16T17:00:00.000Z'),
(18, 5, 'OP-003', 'Carlos Rodríguez', '2025-11-13T18:00:00.000Z', 85, 1335, 113475, NULL, 'estacion', 'Estación Copec, Valdivia', '2025-11-13T18:00:00.000Z'),
(19, 1, 'OP-001', 'Juan Pérez', '2025-11-11T12:00:00.000Z', 165, 1265, 208725, 'OT-2024-001', 'bodega', 'Base FUTAMAQ, Valdivia', '2025-11-11T12:00:00.000Z')
ON CONFLICT DO NOTHING;

-- INSERT SPARE PARTS
INSERT INTO spare_parts (id, description, category, current_stock, minimum_stock, unit_cost, supplier, machinery_id, created_at, code) VALUES
(1, 'Aceite Motor 15W40', 'Lubricantes', 45, 20, 8500, 'Distribuidora Lubricantes SA', NULL, '2024-01-10T10:00:00Z', 'REP-001'),
(2, 'Filtro de Aceite - John Deere', 'Filtros', 8, 10, 12000, 'Repuestos Agrícolas Ltda.', 1, '2024-01-10T10:00:00Z', 'REP-002'),
(3, 'Filtro de Aire - Case IH', 'Filtros', 5, 8, 15000, 'Repuestos Agrícolas Ltda.', 2, '2024-01-10T10:00:00Z', 'REP-003'),
(4, 'Correas Transmisión', 'Transmisión', 12, 15, 25000, 'Componentes Mecánicos SA', NULL, '2024-01-10T10:00:00Z', 'REP-004'),
(5, 'Kit Embrague', 'Transmisión', 3, 5, 180000, 'Componentes Mecánicos SA', NULL, '2024-01-10T10:00:00Z', 'REP-005'),
(6, 'Filtro de Combustible - John Deere 6120M', 'Filtros', 15, 8, 18000, 'Repuestos Agrícolas Ltda.', 1, '2024-01-15T10:00:00Z', 'REP-006'),
(7, 'Aceite Hidráulico ISO 46', 'Lubricantes', 32, 15, 12000, 'Distribuidora Lubricantes SA', NULL, '2024-01-15T10:00:00Z', 'REP-007'),
(8, 'Bujías - Case IH Puma 165', 'Encendido', 20, 12, 8500, 'Sistema de Encendido SA', 2, '2024-01-18T10:00:00Z', 'REP-008'),
(9, 'Pastillas de Freno Delanteras', 'Frenos', 6, 8, 45000, 'Frenos y Embragues Ltda.', NULL, '2024-01-20T10:00:00Z', 'REP-009'),
(10, 'Filtro de Aceite Hidráulico - New Holland', 'Filtros', 10, 6, 22000, 'Repuestos Agrícolas Ltda.', 3, '2024-01-22T10:00:00Z', 'REP-010'),
(11, 'Aceite de Transmisión 80W90', 'Lubricantes', 28, 12, 15000, 'Distribuidora Lubricantes SA', NULL, '2024-01-25T10:00:00Z', 'REP-011'),
(12, 'Correas Alternador - Mercedes-Benz', 'Transmisión', 4, 6, 35000, 'Componentes Mecánicos SA', 5, '2024-01-28T10:00:00Z', 'REP-012'),
(13, 'Filtro de Aire Principal - John Deere', 'Filtros', 12, 8, 28000, 'Repuestos Agrícolas Ltda.', 1, '2024-02-01T10:00:00Z', 'REP-013'),
(14, 'Pastillas de Freno Traseras', 'Frenos', 8, 6, 42000, 'Frenos y Embragues Ltda.', NULL, '2024-02-05T10:00:00Z', 'REP-014'),
(15, 'Filtro de Combustible - Case IH', 'Filtros', 9, 8, 16000, 'Repuestos Agrícolas Ltda.', 2, '2024-02-08T10:00:00Z', 'REP-015'),
(16, 'Aceite Motor 10W30', 'Lubricantes', 38, 20, 9200, 'Distribuidora Lubricantes SA', NULL, '2024-02-10T10:00:00Z', 'REP-016'),
(17, 'Filtro de Aceite - New Holland CR8.90', 'Filtros', 7, 6, 25000, 'Repuestos Agrícolas Ltda.', 3, '2024-02-12T10:00:00Z', 'REP-017'),
(18, 'Disco de Embrague', 'Transmisión', 5, 4, 125000, 'Componentes Mecánicos SA', NULL, '2024-02-15T10:00:00Z', 'REP-018'),
(19, 'Filtro de Aire Secundario - Case IH', 'Filtros', 6, 5, 18000, 'Repuestos Agrícolas Ltda.', 2, '2024-02-18T10:00:00Z', 'REP-019'),
(20, 'Aceite de Diferencial 85W140', 'Lubricantes', 22, 10, 18000, 'Distribuidora Lubricantes SA', NULL, '2024-02-20T10:00:00Z', 'REP-020'),
(21, 'Filtro de Combustible - Mercedes-Benz', 'Filtros', 11, 8, 14000, 'Repuestos Agrícolas Ltda.', 5, '2024-02-22T10:00:00Z', 'REP-021'),
(22, 'Bujías - John Deere 6120M', 'Encendido', 16, 10, 9500, 'Sistema de Encendido SA', 1, '2024-02-25T10:00:00Z', 'REP-022'),
(23, 'Correas de Ventilador', 'Transmisión', 14, 10, 22000, 'Componentes Mecánicos SA', NULL, '2024-02-28T10:00:00Z', 'REP-023'),
(24, 'Filtro de Aire - New Holland CR8.90', 'Filtros', 8, 6, 32000, 'Repuestos Agrícolas Ltda.', 3, '2024-03-01T10:00:00Z', 'REP-024'),
(25, 'Aceite Motor 20W50', 'Lubricantes', 30, 15, 8800, 'Distribuidora Lubricantes SA', NULL, '2024-03-05T10:00:00Z', 'REP-025'),
(26, 'Kit de Filtros - Case IH Puma 165', 'Filtros', 4, 5, 55000, 'Repuestos Agrícolas Ltda.', 2, '2024-03-08T10:00:00Z', 'REP-026'),
(27, 'Zapatas de Freno', 'Frenos', 10, 8, 38000, 'Frenos y Embragues Ltda.', NULL, '2024-03-10T10:00:00Z', 'REP-027'),
(28, 'Filtro de Aceite - Mercedes-Benz Atego', 'Filtros', 13, 8, 19000, 'Repuestos Agrícolas Ltda.', 5, '2024-03-12T10:00:00Z', 'REP-028'),
(29, 'Aceite Hidráulico AW 46', 'Lubricantes', 40, 20, 11000, 'Distribuidora Lubricantes SA', NULL, '2024-03-15T10:00:00Z', 'REP-029'),
(30, 'Filtro de Aire - Kuhn HR 4030', 'Filtros', 6, 5, 15000, 'Repuestos Agrícolas Ltda.', 4, '2024-03-18T10:00:00Z', 'REP-030')
ON CONFLICT DO NOTHING;

-- INSERT PART MOVEMENTS
INSERT INTO part_movements (id, part_id, part_description, movement_type, quantity, reason, work_order_id, operator, date, created_at) VALUES
(1, 2, 'Filtro de Aceite - John Deere', 'entrada', 15, 'Compra de proveedor', NULL, 'Juan Pérez', '2024-05-15', '2024-05-15T10:00:00Z'),
(2, 2, 'Filtro de Aceite - John Deere', 'salida', 7, 'Mantenimiento preventivo', NULL, 'Carlos Rodríguez', '2024-06-18', '2024-06-18T14:30:00Z'),
(3, 1, 'Aceite Motor 15W40', 'entrada', 50, 'Recepción de pedido', NULL, 'María González', '2024-07-10', '2024-07-10T09:00:00Z'),
(4, 3, 'Filtro de Aire - Case IH', 'salida', 3, 'Uso en mantenimiento', NULL, 'Pedro Martínez', '2024-08-20', '2024-08-20T11:15:00Z'),
(5, 6, 'Filtro de Combustible - John Deere 6120M', 'entrada', 20, 'Compra de repuestos', NULL, 'Juan Pérez', '2024-09-12', '2024-09-12T16:00:00Z'),
(6, 8, 'Bujías - Case IH Puma 165', 'salida', 8, 'Cambio de bujías en mantenimiento', NULL, 'Carlos Rodríguez', '2024-05-19', '2024-05-19T08:30:00Z'),
(7, 7, 'Aceite Hidráulico ISO 46', 'entrada', 40, 'Reabastecimiento de inventario', NULL, 'María González', '2024-07-08', '2024-07-08T10:00:00Z'),
(8, 9, 'Pastillas de Freno Delanteras', 'salida', 2, 'Reemplazo en vehículo', NULL, 'Pedro Martínez', '2024-06-21', '2024-06-21T15:45:00Z')
ON CONFLICT DO NOTHING;

-- INSERT ANALYTICS CACHE
INSERT INTO system_config (key, value, description) VALUES
('analisis_dashboard_data', '{"performance":{"efficiency":87.5,"utilization":92.3,"productivity":78.9,"costEffectiveness":85.2},"trends":{"fuelConsumption":[{"date":"2024-03-01","value":1200},{"date":"2024-03-08","value":1350},{"date":"2024-03-15","value":1100},{"date":"2024-03-22","value":1400},{"date":"2024-03-29","value":1250}],"maintenanceCosts":[{"date":"2024-03-01","value":450000},{"date":"2024-03-08","value":520000},{"date":"2024-03-15","value":380000},{"date":"2024-03-22","value":610000},{"date":"2024-03-29","value":490000}],"productivity":[{"date":"2024-03-01","value":75},{"date":"2024-03-08","value":82},{"date":"2024-03-15","value":78},{"date":"2024-03-22","value":85},{"date":"2024-03-29","value":88}],"revenue":[{"date":"2024-03-01","value":2500000},{"date":"2024-03-08","value":2800000},{"date":"2024-03-15","value":2600000},{"date":"2024-03-22","value":3000000},{"date":"2024-03-29","value":2900000}]},"insights":[{"id":1,"type":"warning","title":"Alto Consumo de Combustible","description":"El tractor T002 ha mostrado un consumo 25% superior al promedio","impact":"high","recommendation":"Revisar el sistema de inyección y realizar mantenimiento preventivo"},{"id":2,"type":"success","title":"Excelente Eficiencia Operacional","description":"La productividad ha aumentado 15% en el último mes","impact":"high","recommendation":"Mantener las prácticas actuales y considerar replicar en otras áreas"},{"id":3,"type":"info","title":"Optimización de Rutas","description":"Se identificaron oportunidades de optimización en las rutas de trabajo","impact":"medium","recommendation":"Implementar sistema de optimización de rutas para reducir tiempos de desplazamiento"},{"id":4,"type":"error","title":"Mantenimiento Atrasado","description":"3 maquinarias tienen mantenimientos vencidos","impact":"high","recommendation":"Programar mantenimientos urgentes para evitar fallas mayores"}],"predictions":{"fuelCost":{"nextMonth":1800000,"trend":"up"},"maintenance":{"nextMonth":650000,"trend":"up"},"productivity":{"nextMonth":90,"trend":"up"}}}', 'Cached data for the Analysis Dashboard'),
('main_dashboard_data', '{"fuelConsumptionData":[{"mes":"Ene","consumo":1200,"costo":1500000},{"mes":"Feb","consumo":1350,"costo":1687500},{"mes":"Mar","consumo":1100,"costo":1375000},{"mes":"Abr","consumo":1450,"costo":1812500},{"mes":"May","consumo":1300,"costo":1625000},{"mes":"Jun","consumo":1250,"costo":1562500}],"maintenanceCostsData":[{"mes":"Ene","preventivo":450000,"correctivo":320000,"emergencia":180000},{"mes":"Feb","preventivo":520000,"correctivo":280000,"emergencia":150000},{"mes":"Mar","preventivo":480000,"correctivo":410000,"emergencia":220000},{"mes":"Abr","preventivo":550000,"correctivo":350000,"emergencia":190000},{"mes":"May","preventivo":500000,"correctivo":380000,"emergencia":160000},{"mes":"Jun","preventivo":580000,"correctivo":420000,"emergencia":210000}],"machineryUtilizationData":[{"name":"Tractores","value":85,"color":"#8ba394"},{"name":"Cosechadoras","value":72,"color":"#64748b"},{"name":"Sembradoras","value":68,"color":"#78716c"},{"name":"Pulverizadores","value":91,"color":"#0ea5e9"}]}', 'Cached data for the Main Dashboard')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- PATCH INCIDENTS (We extracted these earlier but let's add them back manually if they were static)
-- Since we are truncating, we should add some incidents back.
INSERT INTO incidents (work_order_id, type, title, description, status, reporter_id, created_at) VALUES 
('OT-2024-001', 'mecanica', 'Falla en sistema hidráulico', 'Se detectó fuga de aceite en manguera principal', 'abierta', 'Pedro Silva', NOW()),
('OT-2024-002', 'climatica', 'Lluvia intensa detiene faena', 'No se puede continuar por condiciones de terreno', 'resuelta', 'María González', NOW() - INTERVAL '2 days');


