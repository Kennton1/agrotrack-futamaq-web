-- =============================================
-- AGROTRACK FUTAMAQ - SCHEMA DE BASE DE DATOS
-- =============================================
-- Script para crear todas las tablas necesarias en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: users (usuarios del sistema)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('administrador', 'operador', 'cliente')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: system_config (configuración y cache del sistema)
-- =============================================
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================
-- TABLA: clients (clientes de FUTAMAQ)
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: machinery (maquinarias y equipos)
-- =============================================
CREATE TABLE IF NOT EXISTS machinery (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    patent VARCHAR(20),
    type VARCHAR(50) NOT NULL CHECK (type IN ('tractor', 'implemento', 'camion', 'cosechadora', 'pulverizador', 'sembradora')),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    total_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('disponible', 'en_faena', 'en_mantencion', 'fuera_servicio')),
    fuel_capacity DECIMAL(8,2) DEFAULT 0,
    hourly_cost DECIMAL(10,2) DEFAULT 0,
    last_location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: work_orders (órdenes de trabajo)
-- =============================================
CREATE TABLE IF NOT EXISTS work_orders (
    id VARCHAR(50) PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('planificada', 'en_ejecucion', 'detenida', 'completada', 'retrasada', 'cancelada')),
    assigned_operator VARCHAR(255),
    assigned_machinery INTEGER[],
    target_hectares DECIMAL(10,2) DEFAULT 0,
    target_hours DECIMAL(8,2) DEFAULT 0,
    actual_hectares DECIMAL(10,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: daily_reports (partes diarios de trabajo)
-- =============================================
CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    work_order_id VARCHAR(50) REFERENCES work_orders(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    operator_id VARCHAR(255) NOT NULL,
    machinery_id INTEGER REFERENCES machinery(id) ON DELETE CASCADE,
    hectares_worked DECIMAL(10,2) DEFAULT 0,
    hours_worked DECIMAL(8,2) DEFAULT 0,
    fuel_consumed DECIMAL(8,2) DEFAULT 0,
    location_start JSONB,
    location_end JSONB,
    observations TEXT,
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: maintenances (mantenimientos)
-- =============================================
CREATE TABLE IF NOT EXISTS maintenances (
    id SERIAL PRIMARY KEY,
    machinery_id INTEGER REFERENCES machinery(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('preventiva', 'correctiva')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('programada', 'en_ejecucion', 'completada', 'vencida')),
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    description TEXT NOT NULL,
    cost DECIMAL(12,2) DEFAULT 0,
    parts_used JSONB,
    technician VARCHAR(255),
    odometer_hours DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: fuel_loads (control de combustible)
-- =============================================
CREATE TABLE IF NOT EXISTS fuel_loads (
    id SERIAL PRIMARY KEY,
    machinery_id INTEGER REFERENCES machinery(id) ON DELETE CASCADE,
    operator_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    liters DECIMAL(8,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    cost_per_liter DECIMAL(8,2) NOT NULL,
    work_order_id VARCHAR(50) REFERENCES work_orders(id) ON DELETE SET NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('bodega', 'estacion')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: spare_parts (inventario repuestos)
-- =============================================
CREATE TABLE IF NOT EXISTS spare_parts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: incidents (incidencias reportadas)
-- =============================================
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    work_order_id VARCHAR(50) REFERENCES work_orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mecanica', 'climatica', 'operacional', 'otra')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('abierta', 'en_curso', 'resuelta')),
    reporter_id VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    photos TEXT[],
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    machinery_id INTEGER REFERENCES machinery(id) ON DELETE CASCADE
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_rut ON clients(rut);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para machinery
CREATE INDEX IF NOT EXISTS idx_machinery_code ON machinery(code);
CREATE INDEX IF NOT EXISTS idx_machinery_status ON machinery(status);
CREATE INDEX IF NOT EXISTS idx_machinery_type ON machinery(type);

-- Índices para work_orders
CREATE INDEX IF NOT EXISTS idx_work_orders_client ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_dates ON work_orders(planned_start_date, planned_end_date);

-- Índices para daily_reports
CREATE INDEX IF NOT EXISTS idx_daily_reports_work_order ON daily_reports(work_order_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_machinery ON daily_reports(machinery_id);

-- Índices para maintenances
CREATE INDEX IF NOT EXISTS idx_maintenances_machinery ON maintenances(machinery_id);
CREATE INDEX IF NOT EXISTS idx_maintenances_status ON maintenances(status);
CREATE INDEX IF NOT EXISTS idx_maintenances_scheduled ON maintenances(scheduled_date);

-- Índices para fuel_loads
CREATE INDEX IF NOT EXISTS idx_fuel_loads_machinery ON fuel_loads(machinery_id);
CREATE INDEX IF NOT EXISTS idx_fuel_loads_date ON fuel_loads(date);
CREATE INDEX IF NOT EXISTS idx_fuel_loads_work_order ON fuel_loads(work_order_id);

-- Índices para spare_parts
CREATE INDEX IF NOT EXISTS idx_spare_parts_code ON spare_parts(code);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON spare_parts(category);

-- Índices para incidents
CREATE INDEX IF NOT EXISTS idx_incidents_work_order ON incidents(work_order_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);

-- =============================================
-- FUNCIONES DE ACTUALIZACIÓN DE TIMESTAMPS
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machinery_updated_at BEFORE UPDATE ON machinery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenances_updated_at BEFORE UPDATE ON maintenances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATOS INICIALES (MOCK DATA)
-- =============================================

-- Insertar usuarios de ejemplo
INSERT INTO users (email, full_name, role, is_active) VALUES
('admin@futamaq.cl', 'Carlos Muñoz', 'administrador', true),
('operador1@futamaq.cl', 'Pedro Silva', 'operador', true),
('operador2@futamaq.cl', 'María González', 'operador', true),
('cliente1@losrobles.cl', 'Juan Pérez Soto', 'cliente', true),
('cliente2@coopvaldivia.cl', 'Ana Martínez', 'cliente', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO clients (name, rut, contact_person, phone, email, address) VALUES
('Agrícola Los Robles S.A.', '76.123.456-7', 'Juan Pérez Soto', '+56912345678', 'juan.perez@losrobles.cl', 'Ruta 5 Sur Km 765, Los Lagos'),
('Cooperativa Campesina Valdivia', '65.987.654-3', 'María González', '+56987654321', 'coordinacion@coopvaldivia.cl', 'Camino Rural Los Laureles s/n'),
('Agrícola San José Ltda.', '78.456.789-2', 'Carlos Rodríguez', '+56945678912', 'carlos@san-jose.cl', 'Camino a Panguipulli Km 12')
ON CONFLICT (rut) DO NOTHING;

-- Insertar maquinarias de ejemplo
INSERT INTO machinery (code, patent, type, brand, model, year, total_hours, status, fuel_capacity, hourly_cost, last_location) VALUES
('T001', 'GJRP-45', 'tractor', 'John Deere', '6120M', 2018, 3450, 'disponible', 180, 25000, '{"lat": -39.8142, "lng": -73.2459, "address": "Base FUTAMAQ, Valdivia"}'),
('T002', 'HJKL-23', 'tractor', 'New Holland', 'T6080', 2019, 2890, 'en_faena', 165, 24000, '{"lat": -39.7500, "lng": -73.1800, "address": "Predio Los Robles, Sector Norte"}'),
('I001', 'N/A', 'implemento', 'Amazone', 'Catros 6001-2', 2020, 1250, 'disponible', 0, 8000, '{"lat": -39.8142, "lng": -73.2459, "address": "Base FUTAMAQ, Valdivia"}'),
('C001', 'MNOP-78', 'cosechadora', 'Claas', 'Lexion 760', 2021, 890, 'disponible', 200, 35000, '{"lat": -39.8142, "lng": -73.2459, "address": "Base FUTAMAQ, Valdivia"}')
ON CONFLICT (code) DO NOTHING;

-- Insertar órdenes de trabajo de ejemplo
INSERT INTO work_orders (id, client_id, field_name, task_type, description, priority, planned_start_date, planned_end_date, actual_start_date, status, assigned_operator, assigned_machinery, target_hectares, target_hours, actual_hectares, actual_hours, progress_percentage) VALUES
('OT-2024-001', 1, 'Potrero Norte', 'Preparación de suelo', 'Rastraje y nivelación de 45 hectáreas para siembra de avena', 'media', '2024-03-15', '2024-03-17', '2024-03-15', 'en_ejecucion', 'Pedro Silva', '{1,3}', 45, 18, 28, 12, 62),
('OT-2024-002', 2, 'Parcela 12', 'Siembra', 'Siembra de trigo en 25 hectáreas', 'alta', '2024-03-20', '2024-03-21', NULL, 'planificada', 'María González', '{2}', 25, 10, 0, 0, 0),
('OT-2024-003', 1, 'Sector Sur', 'Cosecha', 'Cosecha de avena en 60 hectáreas', 'alta', '2024-03-25', '2024-03-28', NULL, 'planificada', 'Carlos Muñoz', '{4}', 60, 24, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Insertar mantenimientos de ejemplo
INSERT INTO maintenances (machinery_id, type, status, scheduled_date, description, cost, technician, odometer_hours) VALUES
(1, 'preventiva', 'programada', '2024-03-28', 'Mantenimiento preventivo cada 100 horas', 150000, 'Técnico Juan', 3450),
(2, 'correctiva', 'en_ejecucion', '2024-03-15', 'Reparación del sistema hidráulico', 250000, 'Técnico Pedro', 2890),
(3, 'preventiva', 'completada', '2024-03-10', 'Lubricación y ajustes generales', 80000, 'Técnico Ana', 1250)
ON CONFLICT DO NOTHING;

-- Insertar repuestos de ejemplo
INSERT INTO spare_parts (code, description, category, current_stock, minimum_stock, unit_cost, supplier) VALUES
('F001', 'Filtro de aceite motor', 'Filtros', 15, 5, 25000, 'Distribuidora Sur'),
('F002', 'Filtro de combustible', 'Filtros', 8, 3, 18000, 'Distribuidora Sur'),
('A001', 'Aceite hidráulico 46', 'Lubricantes', 50, 20, 12000, 'Lubricantes del Sur'),
('R001', 'Rodamiento 6205', 'Rodamientos', 12, 4, 35000, 'Rodamientos Central'),
('C001', 'Correa trapezoidal A-50', 'Correas', 25, 10, 15000, 'Correas del Sur')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (todos pueden leer, solo autenticados pueden escribir)
-- En producción, estas políticas deberían ser más restrictivas

-- Política para system_config
CREATE POLICY "Users can view system_config" ON system_config FOR SELECT USING (true);


-- Política para users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update users" ON users FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete users" ON users FOR DELETE USING (auth.role() = 'authenticated');

-- Política para clients
CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert clients" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete clients" ON clients FOR DELETE USING (auth.role() = 'authenticated');

-- Política para machinery
CREATE POLICY "Users can view all machinery" ON machinery FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert machinery" ON machinery FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update machinery" ON machinery FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete machinery" ON machinery FOR DELETE USING (auth.role() = 'authenticated');

-- Política para work_orders
CREATE POLICY "Users can view all work_orders" ON work_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert work_orders" ON work_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update work_orders" ON work_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete work_orders" ON work_orders FOR DELETE USING (auth.role() = 'authenticated');

-- Política para daily_reports
CREATE POLICY "Users can view all daily_reports" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert daily_reports" ON daily_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update daily_reports" ON daily_reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete daily_reports" ON daily_reports FOR DELETE USING (auth.role() = 'authenticated');

-- Política para maintenances
CREATE POLICY "Users can view all maintenances" ON maintenances FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert maintenances" ON maintenances FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update maintenances" ON maintenances FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete maintenances" ON maintenances FOR DELETE USING (auth.role() = 'authenticated');

-- Política para fuel_loads
CREATE POLICY "Users can view all fuel_loads" ON fuel_loads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert fuel_loads" ON fuel_loads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update fuel_loads" ON fuel_loads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete fuel_loads" ON fuel_loads FOR DELETE USING (auth.role() = 'authenticated');

-- Política para spare_parts
CREATE POLICY "Users can view all spare_parts" ON spare_parts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert spare_parts" ON spare_parts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update spare_parts" ON spare_parts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete spare_parts" ON spare_parts FOR DELETE USING (auth.role() = 'authenticated');

-- Política para incidents
CREATE POLICY "Users can view all incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert incidents" ON incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update incidents" ON incidents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete incidents" ON incidents FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- COMENTARIOS FINALES
-- =============================================

-- Este script crea la estructura completa de la base de datos para AgroTrack FUTAMAQ
-- Incluye:
-- - Todas las tablas necesarias con relaciones
-- - Índices para optimización
-- - Triggers para actualización automática de timestamps
-- - Datos de ejemplo para testing
-- - Políticas de seguridad básicas (RLS)
--
-- Para usar:
-- 1. Crear proyecto en Supabase
-- 2. Ir al SQL Editor
-- 3. Ejecutar este script completo
-- 4. Configurar las credenciales en .env.local
-- 5. Reiniciar la aplicación

