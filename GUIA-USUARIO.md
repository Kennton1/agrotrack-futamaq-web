# Manual de Usuario - AgroTrack FUTAMAQ

## Introducción

Bienvenido al Manual de Usuario de AgroTrack FUTAMAQ, el sistema integral de gestión agrícola para controlar maquinarias, órdenes de trabajo, mantenimientos, combustible y repuestos.

Este manual está dirigido a todos los usuarios del sistema (Administradores, Operadores y Clientes) y está organizado en 14 puntos que cubren todas las funcionalidades disponibles.

Cada punto incluye una explicación breve de qué se hace y los pasos detallados para realizar cada acción. Si eres nuevo en el sistema, te recomendamos leer el manual de forma secuencial desde el Punto 1. Si necesitas información específica, puedes navegar directamente al punto que te interese.

Para utilizar el sistema necesitas un navegador web actualizado, conexión a internet y credenciales de acceso proporcionadas por el administrador. El sistema inicia en modo oscuro por defecto, pero puedes cambiarlo según tus preferencias.

---

Esta guía te ayudará a utilizar el sistema AgroTrack FUTAMAQ de manera efectiva. Aprenderás a navegar por la interfaz, gestionar maquinarias, crear órdenes de trabajo, registrar mantenimientos y mucho más.

---

## Punto 1: Acceder al Sistema e Iniciar Sesión

**¿Qué estamos haciendo?**  
Ingresamos al sistema usando nuestro email y contraseña para acceder a todas las funcionalidades según nuestro rol de usuario.

**Pasos:**

1. Abre tu navegador y ve a la dirección del sistema

2. Completa el formulario de login:
   - **Correo Electrónico**: Ingresa tu email registrado
   - **Contraseña**: Ingresa tu contraseña (puedes hacer clic en el ícono del ojo para verla)

3. Opcional: Marca **"Recordarme"** para mantener tu sesión activa

4. Haz clic en **"Iniciar Sesión"** o presiona `Enter`

5. Si las credenciales son correctas, serás redirigido al Dashboard principal

**Nota:** Si olvidaste tu contraseña, contacta al administrador del sistema.

---

## Punto 2: Conocer la Interfaz y Navegación

**¿Qué estamos haciendo?**  
Conocemos la estructura básica de la interfaz para navegar entre las diferentes secciones del sistema.

**Elementos principales:**

1. **Barra Superior:**
   - Menú hamburguesa (☰): Abre/cierra el menú en móviles
   - Logo FUTAMAQ: Haz clic para ir al Dashboard
   - Buscador Global: Busca en todo el sistema
   - Notificaciones (🔔): Alertas importantes
   - Perfil de Usuario: Accede a tu perfil y cierra sesión
   - Selector de Tema: Cambia entre modo claro/oscuro

2. **Menú Lateral:**
   - Inicio, Órdenes de Trabajo, Maquinarias, Mantenimientos, Combustible, Repuestos, Reportes, Análisis, Incidencias
   - Haz clic en cualquier opción para cambiar de sección

3. **Área de Contenido:**
   - Muestra la información y funcionalidades de la sección seleccionada

---

## Punto 3: Usar el Dashboard Principal

**¿Qué estamos haciendo?**  
Revisamos el Dashboard principal que muestra un resumen general de la operación con KPIs, alertas y gráficos.

**Elementos principales:**

1. **Tarjetas de KPIs:**
   - Hectáreas Procesadas, Combustible Consumido, Costos de Mantenimiento, Horas de Operación

2. **Centro de Gestión:**
   - Botones de acceso rápido a: Órdenes de Trabajo, Maquinarias, Mantenimientos, Combustible, Repuestos, Reportes
   - Haz clic en cualquier botón para ir a esa sección

3. **Alertas y Tareas Pendientes:**
   - Muestra mantenimientos próximos, órdenes retrasadas, maquinarias fuera de servicio
   - Cada alerta tiene botones de acción: "Ver Detalles", "Revisar", "Gestionar", "Planificar"

4. **Gráficos:**
   - Costos de Mantenimiento (barras), Consumo de Combustible (líneas), Utilización de Maquinarias (circular)

---

## Punto 4: Gestionar Maquinarias

**¿Qué estamos haciendo?**  
Administramos el inventario de maquinarias: agregar, editar, ver detalles y eliminar maquinarias.

**Pasos:**

1. **Buscar/Filtrar:**
   - Usa el campo de búsqueda para buscar por marca, modelo o patente
   - Filtra por tipo o estado usando los menús desplegables

2. **Agregar Nueva Maquinaria:**
   - Haz clic en **"+ Nueva Maquinaria"**
   - Completa: marca, modelo, patente, tipo, año, horas de uso, estado, ubicación (opcional)
   - Opcional: sube imágenes de la maquinaria
   - Haz clic en **"Guardar"**

3. **Ver Detalles:**
   - Haz clic en **"Ver"** (👁️) en la tarjeta de la maquinaria
   - Se mostrará información detallada, historial de mantenimientos e imágenes

4. **Editar:**
   - Haz clic en **"Editar"** (✏️), modifica los campos necesarios y haz clic en **"Guardar"**

5. **Eliminar:**
   - Haz clic en **"Eliminar"** (🗑️) y confirma la eliminación

6. **Ver Mapa:**
   - Haz clic en **"Ver Mapa"** para ver la ubicación de todas las maquinarias

---

## Punto 5: Crear y Gestionar Órdenes de Trabajo

**¿Qué estamos haciendo?**  
Creamos y gestionamos órdenes de trabajo para planificar faenas agrícolas, asignar recursos (maquinarias y operadores) y hacer seguimiento del progreso del trabajo en campo.

**Funcionalidades disponibles:**

1. **Ver Lista de Órdenes:**
   - Al entrar a "Órdenes de Trabajo" verás todas las órdenes activas en formato de tarjetas
   - Cada tarjeta muestra: ID de orden, campo, cliente, tipo de tarea, prioridad, fechas planificadas, descripción, progreso (%), operador asignado
   - Las órdenes completadas y canceladas no se muestran por defecto (solo aparecen si las buscas o filtras)

2. **Buscar Órdenes:**
   - Usa el campo de búsqueda en la parte superior
   - Puedes buscar por: ID de orden, nombre del campo, tipo de tarea o nombre del operador asignado
   - Los resultados se filtran automáticamente mientras escribes

3. **Filtrar Órdenes:**
   - **Filtro por Estado**: Selecciona de los menús desplegables:
     - Planificada
     - En Ejecución
     - Completada
     - Atrasada
   - **Filtro por Prioridad**: 
     - Baja
     - Media
     - Alta
     - Crítica

4. **Tarjetas de Estadísticas (Filtros Rápidos):**
   - En la parte superior verás 5 tarjetas con estadísticas:
     - **Total Órdenes**: Muestra el total de órdenes activas (excluye completadas y canceladas)
     - **Atrasadas**: Muestra órdenes con estado "Retrasada" (haz clic para filtrar solo estas)
     - **En Ejecución**: Muestra órdenes en ejecución (haz clic para filtrar)
     - **Planificadas**: Muestra órdenes planificadas (haz clic para filtrar)
     - **Completadas**: Muestra órdenes completadas (haz clic para filtrar)
   - Haz clic en cualquier tarjeta para filtrar rápidamente por ese estado
   - Haz clic nuevamente en la misma tarjeta para quitar el filtro

5. **Crear Nueva Orden de Trabajo:**
   - Haz clic en el botón **"+ Nueva Orden"** en la esquina superior derecha
   - Se abrirá un modal con formulario completo. Completa los siguientes campos:
     - **Cliente** (requerido): Selecciona de la lista de clientes disponibles
     - **Campo** (requerido): Una vez seleccionado el cliente, aparecerán los campos disponibles para ese cliente
     - **Tipo de Tarea** (requerido): Selecciona de la lista (Preparación de suelo, Siembra, Fertilización, Fumigación, Riego, Cosecha, Transporte, Mantenimiento de campo, Control de malezas, Arado, Rastraje, Subsolado, Pulverización, Desmalezado, Aplicación de herbicida, Aplicación de fertilizante, Labranza, Cultivo, Otro)
     - **Prioridad** (requerido): Baja, Media, Alta o Crítica
     - **Fecha de Inicio Planificada** (requerido): Fecha en que se planifica comenzar
     - **Fecha de Fin Planificada** (requerido): Fecha en que se planifica terminar
     - **Total de Hectáreas** (opcional): Superficie a trabajar
     - **Descripción** (requerido): Detalle de la tarea a realizar
     - **Maquinarias Asignadas** (requerido): 
       - El sistema filtra automáticamente las maquinarias relevantes según el tipo de tarea seleccionado
       - Por ejemplo, si seleccionas "Cosecha", solo mostrará cosechadoras y tractores
       - Marca con checkboxes las maquinarias que se usarán (puedes seleccionar múltiples)
       - Debes seleccionar al menos una maquinaria
   - Haz clic en **"Crear Orden de Trabajo"** para guardar

6. **Ver Detalles de una Orden:**
   - Haz clic en el botón **"Ver"** (👁️) en la tarjeta de la orden
   - Se abrirá un modal mostrando información detallada:
     - **Información General**: Estado, prioridad, tipo de tarea, operador asignado
     - **Fechas**: Fecha de inicio planificada, fecha de fin planificada, fecha de inicio real (si existe), fecha de fin real (si existe)
     - **Progreso**: Porcentaje de progreso con barra visual, hectáreas (reales / objetivo), horas (reales / objetivo)
     - **Descripción**: Descripción completa de la tarea
   - Desde este modal puedes hacer clic en **"Editar"** para modificar la orden o **"Cerrar"** para volver

7. **Editar Orden de Trabajo:**
   - Haz clic en el botón **"Editar"** (✏️) en la tarjeta de la orden o desde el modal de detalles
   - Se abrirá un formulario con la información actual. Puedes modificar:
     - **Cliente**: Cambiar el cliente (esto actualizará los campos disponibles)
     - **Campo**: Cambiar el campo según el cliente seleccionado
     - **Tipo de Tarea**: Cambiar el tipo (esto actualizará las maquinarias sugeridas)
     - **Prioridad**: Cambiar la prioridad
     - **Estado**: Cambiar el estado (Planificada, En Ejecución, Completada, Retrasada, Detenida)
     - **Fechas Planificadas**: Modificar fechas de inicio y fin planificadas
     - **Fechas Reales** (opcional): Agregar o modificar fecha de inicio real y fecha de fin real
     - **Total de Hectáreas**: Modificar hectáreas objetivo
     - **Hectáreas Reales**: Actualizar hectáreas realmente trabajadas
     - **Progreso (%)**: Actualizar el porcentaje de progreso (0-100)
     - **Descripción**: Modificar la descripción
     - **Maquinarias Asignadas**: Agregar o quitar maquinarias (se filtran según el tipo de tarea)
   - Haz clic en **"Guardar Cambios"** para aplicar las modificaciones

8. **Eliminar Orden de Trabajo:**
   - Haz clic en el botón **"Eliminar"** (🗑️) en la tarjeta de la orden
   - Se mostrará un modal de confirmación con el ID y campo de la orden
   - Confirma la eliminación haciendo clic en **"Eliminar"** o cancela la operación
   - **Nota**: Esta acción no se puede deshacer

9. **Paginación:**
   - Si hay muchas órdenes, verás controles de paginación en la parte inferior
   - Usa los botones "Anterior" y "Siguiente" o haz clic en el número de página para navegar
   - Se muestran hasta 9 órdenes por página

10. **Cambiar Estado de una Orden:**
    - Puedes cambiar el estado desde el formulario de edición
    - Estados disponibles: Planificada → En Ejecución → Completada
    - También puedes marcar como Retrasada o Detenida si hay problemas
    - El cambio de estado actualiza automáticamente las estadísticas en las tarjetas superiores

---

## Punto 6: Registrar y Gestionar Mantenimientos

¿Qué estamos haciendo?  
Registramos mantenimientos realizados, programamos futuros y hacemos seguimiento del historial para mantener las máquinas en óptimas condiciones.

Pasos:

1. Ver Mantenimientos:
   - Calendario: muestra mantenimientos programados por fecha
   - Lista: cambia a vista de lista para ver todos los mantenimientos

2. Buscar/Filtrar:
   - Busca por tipo, maquinaria o descripción
   - Filtra por tipo (Preventivo, Correctivo, Emergencia), estado o maquinaria

3. Registrar Nuevo Mantenimiento:
   - Haz clic en "+ Nuevo Mantenimiento"
   - Completa: tipo, maquinaria, fecha, descripción, costo estimado, técnico responsable
   - Opcional: agrega múltiples items (cambio de aceite, filtros, etc.)
   - Haz clic en "Guardar"

4. Ver Detalles:
   - Haz clic en "Ver" para ver información detallada, items, costos y técnico

5. Editar:
   - Haz clic en "Editar", modifica los campos y haz clic en "Guardar"

6. Eliminar:
   - Haz clic en "Eliminar" y confirma

7. Marcar como Completado:
   - Desde la vista de detalles, cambia el estado a "Completado"

---

## Punto 7: Registrar Cargas de Combustible

¿Qué estamos haciendo?  
Registramos las cargas de combustible para controlar consumo, costos y disponibilidad de combustible.

Pasos:

1. Buscar/Filtrar:
   - Busca por maquinaria, proveedor o número de factura
   - Filtra por maquinaria, proveedor o rango de fechas

2. Registrar Nueva Carga:
   - Haz clic en "+ Nueva Carga"
   - Completa: maquinaria, fecha, litros, precio por litro (el costo total se calcula automáticamente), proveedor, número de factura, odómetro/horas
   - Opcional: sube imagen del comprobante
   - Haz clic en "Guardar"

3. Ver Detalles:
   - Haz clic en "Ver" para ver información detallada, imagen del comprobante y estadísticas de consumo

4. Editar:
   - Haz clic en "Editar", modifica los campos y haz clic en "Guardar"

5. Eliminar:
   - Haz clic en "Eliminar" y confirma

---

## Punto 8: Gestionar Inventario de Repuestos

¿Qué estamos haciendo?  
Administramos el inventario de repuestos controlando stock, precios y ubicación para facilitar su uso en mantenimientos.

Pasos:

1. Buscar/Filtrar:
   - Busca por nombre, categoría, código o descripción
   - Filtra por categoría, estado de stock o ubicación

2. Agregar Nuevo Repuesto:
   - Haz clic en "+ Nuevo Repuesto"
   - Completa: nombre, categoría, código, descripción, stock inicial, stock mínimo, precio unitario, proveedor, ubicación
   - Opcional: sube imagen del repuesto
   - Haz clic en "Guardar"

3. Ver Detalles:
   - Haz clic en "Ver" para ver información detallada, historial de movimientos e imagen

4. Editar:
   - Haz clic en "Editar", modifica los campos (puedes actualizar stock, precio, etc.) y haz clic en "Guardar"

5. Eliminar:
   - Haz clic en "Eliminar" y confirma

---

## Punto 9: Generar y Exportar Reportes

¿Qué estamos haciendo?  
Generamos reportes detallados sobre diferentes aspectos de la operación y los exportamos en diferentes formatos para análisis.

Pasos:

1. Ver Reportes Disponibles:
   - Al entrar a "Reportes" verás tarjetas con diferentes tipos: Maquinarias, Mantenimientos, Combustible, Órdenes de Trabajo, Repuestos, Financiero

2. Configurar y Generar:
   - Haz clic en "Ver Opciones" en la tarjeta del reporte deseado
   - Configura: rango de fechas, maquinarias (opcional), tipo de datos, formato de exportación (PDF, Excel, CSV)
   - Haz clic en "Generar Reporte"

3. Exportar:
   - Una vez generado, haz clic en el botón del formato deseado (PDF, Excel, CSV)
   - El archivo se descargará automáticamente

4. Ver en Pantalla:
   - Algunos reportes se pueden visualizar directamente con gráficos y tablas interactivas

---

## Punto 10: Gestionar Usuarios del Sistema

¿Qué estamos haciendo?  
Administramos usuarios del sistema: crear cuentas, editar información y asignar roles. Solo disponible para administradores.

Pasos:

1. Buscar/Filtrar:
   - Busca por nombre, email o teléfono
   - Filtra por rol (Administrador, Operador, Cliente) o estado (Activo, Inactivo)

2. Crear Nuevo Usuario:
   - Haz clic en "+ Nuevo Usuario"
   - Completa: nombre completo, email, teléfono, rol, contraseña y confirmar contraseña
   - Haz clic en "Guardar"

3. Ver Detalles:
   - Haz clic en "Ver" para ver información personal, rol, permisos e historial

4. Editar:
   - Haz clic en "Editar", modifica nombre, teléfono, rol o estado y haz clic en "Guardar"

5. Eliminar:
   - Haz clic en "Eliminar" y confirma (la eliminación es permanente)

---

## Punto 11: Configurar Perfil de Usuario

¿Qué estamos haciendo?  
Actualizamos nuestra información personal, cambiamos la contraseña y configuramos preferencias de la cuenta.

Pasos:

1. Acceder al Perfil:
   - Haz clic en tu nombre o foto de perfil en la barra superior
   - Selecciona "Mi Perfil" del menú desplegable

2. Editar Información Personal:
   - Haz clic en "Editar Perfil"
   - Modifica: nombre completo, teléfono, foto de perfil
   - Haz clic en "Guardar"

3. Cambiar Contraseña:
   - Haz clic en "Cambiar Contraseña"
   - Completa: contraseña actual, nueva contraseña, confirmar nueva contraseña
   - Haz clic en "Actualizar Contraseña"
   - Nota: Usa una contraseña segura con al menos 8 caracteres

---

## Punto 12: Usar el Modo Oscuro y Cambiar el Tema

¿Qué estamos haciendo?  
Cambiamos entre modo oscuro y modo claro según nuestras preferencias visuales.

Pasos:

1. Localizar el Selector:
   - Busca el ícono de luna o sol en la barra superior

2. Cambiar Tema:
   - Haz clic en el ícono de luna para modo oscuro
   - Haz clic en el ícono de sol para modo claro
   - El cambio es instantáneo y se guarda automáticamente

Nota: El sistema inicia en modo oscuro por defecto y mantiene tu preferencia en futuras sesiones.

---

## Punto 13: Usar el Buscador Global

¿Qué estamos haciendo?  
Utilizamos el buscador global para encontrar rápidamente información en todo el sistema.

Pasos:

1. Localizar el Buscador:
   - El buscador está en la barra superior (ícono de lupa)

2. Realizar Búsqueda:
   - Haz clic en el campo o presiona `Ctrl + K` (o `Cmd + K` en Mac)
   - Escribe lo que buscas: nombre de maquinaria, ID de orden, usuario, etc.

3. Ver y Seleccionar Resultados:
   - Mientras escribes aparecen resultados sugeridos organizados por categoría
   - Haz clic en cualquier resultado para ir directamente a ese elemento

4. Limpiar:
   - Haz clic fuera del buscador o presiona `Escape` para cerrar

---

## Punto 14: Cerrar Sesión

¿Qué estamos haciendo?  
Cerramos nuestra sesión de forma segura para proteger nuestra cuenta.

Pasos:

1. Abrir Menú de Usuario:
   - Haz clic en tu nombre o foto de perfil en la barra superior

2. Cerrar Sesión:
   - Selecciona "Cerrar Sesión" del menú desplegable
   - Serás redirigido automáticamente a la página de inicio de sesión

Nota: Siempre cierra sesión cuando uses una computadora compartida o pública.

---

## Consejos y Mejores Prácticas

### Organización de Datos
- Mantén la información de maquinarias actualizada regularmente
- Registra los mantenimientos inmediatamente después de realizarlos
- Actualiza el stock de repuestos cuando se compren o utilicen

### Uso Eficiente
- Usa los filtros para encontrar información rápidamente
- Aprovecha el buscador global para búsquedas rápidas
- Revisa el Dashboard regularmente para estar al tanto de alertas importantes

### Seguridad
- No compartas tus credenciales de acceso
- Cambia tu contraseña periódicamente
- Cierra sesión cuando uses computadoras compartidas

### Reportes
- Genera reportes periódicos para análisis y planificación
- Exporta los reportes en el formato que mejor se adapte a tus necesidades
- Usa los filtros de fechas para reportes específicos

---

## Solución de Problemas Comunes

### No puedo iniciar sesión
- Verifica que tu email y contraseña sean correctos
- Asegúrate de que tu cuenta esté activa
- Contacta al administrador si el problema persiste

### No veo ciertas opciones del menú
- Algunas funcionalidades están disponibles solo para ciertos roles
- Verifica tu rol de usuario con el administrador
- Los administradores tienen acceso a todas las funcionalidades

### Los datos no se guardan
- Verifica tu conexión a internet
- Asegúrate de completar todos los campos obligatorios (marcados con *)
- Revisa si hay mensajes de error en la pantalla

### El modo oscuro no se mantiene
- Limpia la caché del navegador (Ctrl + Shift + Delete)
- Verifica que las cookies estén habilitadas
- Intenta cambiar el tema nuevamente

---

¿Necesitas ayuda adicional? Contacta al administrador del sistema o revisa la documentación técnica del proyecto.

