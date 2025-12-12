
-- Insertar Clientes (Coinciden con los hardcodeados en el frontend)
INSERT INTO public.clients (id, name, rut, contact_person, phone, email, address, created_at)
VALUES 
  (1, 'Agrícola San Antonio S.A.', '76.123.456-7', 'Juan Pérez', '+56 9 1111 2222', 'contacto@sanantonio.cl', 'Camino Real 123', NOW()),
  (2, 'Fundo El Carmen', '76.234.567-8', 'María González', '+56 9 3333 4444', 'maria@elcarmen.cl', 'Ruta 5 Sur Km 200', NOW()),
  (3, 'Cooperativa Agrícola Los Ríos', '76.345.678-9', 'Pedro Soto', '+56 9 5555 6666', 'coop@losrios.cl', 'Av. Central 456', NOW()),
  (4, 'Hacienda Santa Rosa', '76.456.789-0', 'Ana Silva', '+56 9 7777 8888', 'ana@santarosa.cl', 'Camino Los Andes 789', NOW()),
  (5, 'Agroindustria del Sur', '76.567.890-1', 'Luis Morales', '+56 9 9999 0000', 'luis@agrosur.cl', 'Parque Industrial Lote 5', NOW());

-- Insertar Maquinarias (Datos de ejemplo para empezar)
INSERT INTO public.machinery (id, code, patent, type, brand, model, year, total_hours, status, fuel_capacity, hourly_cost, created_at)
VALUES
  (1, 'MQ-001', 'AB-CD-12', 'tractor', 'John Deere', '6120M', 2022, 1200, 'disponible', 200, 45000, NOW()),
  (2, 'MQ-002', 'WX-YZ-34', 'cosechadora', 'Claas', 'Lexion 760', 2021, 850, 'disponible', 800, 120000, NOW()),
  (3, 'MQ-003', 'EF-GH-56', 'pulverizador', 'Jacto', 'Uniport 3030', 2023, 400, 'en_faena', 300, 65000, NOW()),
  (4, 'MQ-004', 'IJ-KL-78', 'camion', 'Mercedes-Benz', 'Actros', 2020, 45000, 'disponible', 400, 80000, NOW()),
  (5, 'MQ-005', 'MN-OP-90', 'sembradora', 'Väderstad', 'Tempo L', 2022, 600, 'en_mantencion', 0, 35000, NOW());

-- Reiniciar secuencias para evitar errores de IDs duplicados
SELECT setval('clients_id_seq', (SELECT MAX(id) FROM public.clients));
SELECT setval('machinery_id_seq', (SELECT MAX(id) FROM public.machinery));
