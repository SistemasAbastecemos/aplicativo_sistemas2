## 1. Primero: Estructura de menu  en la BD prueba

se puede hacer un backup para probar




```sql

-- 1. CONFIGURACIÓN (reemplaza Formatos)
UPDATE menu SET nombre = 'Configuración', icono = 'cog' WHERE id = 3;

-- 2. PANEL ADMIN (dentro de Configuración)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Panel Admin', '#', 'users', 1, 1, 3, 1, 1),
('Usuarios', '/usuarios', 'user', 1, 1, (SELECT id FROM menu WHERE nombre = 'Panel Admin'), 1, 1),
('Proveedores', '/proveedores', 'truck', 2, 1, (SELECT id FROM menu WHERE nombre = 'Panel Admin'), 1, 1),
('Actualizar Inventario', '/actualizar_inventario', 'package', 3, 1, (SELECT id FROM menu WHERE nombre = 'Panel Admin'), 1, 1);

-- 3. FRUVER (reemplaza Comprobantes)
UPDATE menu SET nombre = 'Fruver', icono = 'shopping-cart' WHERE id = 5;

-- 4. ADMINISTRAR ITEMS (dentro de Fruver)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Administrar Items', '/admin_items', 'box', 1, 1, 5, 1, 1),
('Pedidos Fruver', '/pedidos_fruver', 'list', 2, 1, 5, 1, 1);

-- 5. CONTABILIDAD (reemplaza Notas)
UPDATE menu SET nombre = 'Contabilidad', icono = 'calculator' WHERE id = 7;

-- 6. ACTUALIZAR PLANOS (dentro de Contabilidad)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Actualizar Planos', '/actualizar_planos', 'map', 1, 1, 7, 1, 1);

-- 7. INFORMES (reemplaza Retenciones)
UPDATE menu SET nombre = 'Informes', icono = 'bar-chart' WHERE id = 12;

-- 8. FINANCIERO (dentro de Informes)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Financiero', '#', 'dollar-sign', 1, 1, 12, 1, 1),
('Reporte Ventas', '/reporte_ventas', 'trending-up', 1, 1, (SELECT id FROM menu WHERE nombre = 'Financiero'), 1, 1),
('Reporte Gastos', '/reporte_gastos', 'trending-down', 2, 1, (SELECT id FROM menu WHERE nombre = 'Financiero'), 1, 1);

-- 9. SISTEMAS (nuevo menú principal)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Sistemas', '#', 'settings', 18, 1, NULL, 1, 1),
('Bitácora', '/bitacora', 'file-text', 1, 1, (SELECT id FROM menu WHERE nombre = 'Sistemas'), 1, 1),
('CVM', '/cvm', 'monitor', 2, 1, (SELECT id FROM menu WHERE nombre = 'Sistemas'), 1, 1);

-- 10. COMPRAS (nuevo menú principal)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Compras', '#', 'shopping-bag', 19, 1, NULL, 1, 1),
('Codificación Productos', '/codificacion_productos', 'barcode', 1, 1, (SELECT id FROM menu WHERE nombre = 'Compras'), 1, 1),
('Programación POS', '/programacion_pos', 'terminal', 2, 1, (SELECT id FROM menu WHERE nombre = 'Compras'), 1, 1);

-- 11. PROGRAMACIÓN (nuevo menú principal)
INSERT INTO menu (nombre, ruta, icono, orden, activo, parent_id, abastecemos, tobar) VALUES
('Programación', '#', 'calendar', 20, 1, NULL, 1, 1),
('Separata', '/separata', 'file', 1, 1, (SELECT id FROM menu WHERE nombre = 'Programación'), 1, 1);
```

```
```
## 2. Crear los componentes React para las nuevas rutas

**src/components/Admin/PanelAdmin.jsx**


```jsx

import React from 'react';
import styles from './PanelAdmin.module.css';

const PanelAdmin = () => {
  return (
    <div className={styles.panelAdmin}>
      <div className={styles.header}>
        <h1>Panel Administrativo</h1>
        <p>Gestión completa del sistema</p>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Usuarios</h3>
          <p>Gestionar usuarios del sistema</p>
        </div>
        <div className={styles.card}>
          <h3>Proveedores</h3>
          <p>Administrar proveedores</p>
        </div>
        <div className={styles.card}>
          <h3>Inventario</h3>
          <p>Actualizar stock y productos</p>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;
```

**src/components/Fruver/AdminItems.jsx**


```jsx

import React from 'react';
import styles from './Fruver.module.css';

const AdminItems = () => {
  return (
    <div className={styles.adminItems}>
      <div className={styles.header}>
        <h1>Administrar Items - Fruver</h1>
        <p>Gestión de productos del área de fruver</p>
      </div>
      {/* Contenido específico de fruver */}
    </div>
  );
};

export default AdminItems;

**src/components/Contabilidad/ActualizarPlanos.jsx**

jsx

import React from 'react';
import styles from './Contabilidad.module.css';

const ActualizarPlanos = () => {
  return (
    <div className={styles.actualizarPlanos}>
      <div className={styles.header}>
        <h1>Actualizar Planos Contables</h1>
        <p>Gestión de planos y cuentas contables</p>
      </div>
      {/* Contenido contable */}
    </div>
  );
};

export default ActualizarPlanos;
```


**src/components/Informes/Financiero.jsx**

```jsx

import React from 'react';
import styles from './Informes.module.css';

const Financiero = () => {
  return (
    <div className={styles.financiero}>
      <div className={styles.header}>
        <h1>Reportes Financieros</h1>
        <p>Análisis financiero y reportes de gestión</p>
      </div>
      
      <div className={styles.reportesGrid}>
        <div className={styles.reporteCard}>
          <h4>Reporte de Ventas</h4>
          <p>Análisis detallado de ventas</p>
        </div>
        <div className={styles.reporteCard}>
          <h4>Reporte de Gastos</h4>
          <p>Control y análisis de gastos</p>
        </div>
      </div>
    </div>
  );
};

export default Financiero;
```

**src/components/Sistemas/Bitacora.jsx**

```jsx

import React from 'react';
import styles from './Sistemas.module.css';

const Bitacora = () => {
  return (
    <div className={styles.bitacora}>
      <div className={styles.header}>
        <h1>Bitácora del Sistema</h1>
        <p>Registro de actividades y eventos del sistema</p>
      </div>
      {/* Contenido de bitácora */}
    </div>
  );
};

export default Bitacora;
```


## 3. Actualizar App.jsx con las nuevas rutas


```jsx

// Agregar estos imports
import PanelAdmin from './components/Admin/PanelAdmin';
import AdminItems from './components/Fruver/AdminItems';
import PedidosFruver from './components/Fruver/PedidosFruver';
import ActualizarPlanos from './components/Contabilidad/ActualizarPlanos';
import Financiero from './components/Informes/Financiero';
import Bitacora from './components/Sistemas/Bitacora';
import CVM from './components/Sistemas/CVM';
import ProgramacionPOS from './components/Compras/ProgramacionPOS';
import Separata from './components/Programacion/Separata';

// Agregar estas rutas en tu App.jsx
<Route path="/usuarios" element={<PrivateRoute><Layout><PanelAdmin /></Layout></PrivateRoute>} />
<Route path="/proveedores" element={<PrivateRoute><Layout><PanelAdmin /></Layout></PrivateRoute>} />
<Route path="/admin_items" element={<PrivateRoute><Layout><AdminItems /></Layout></PrivateRoute>} />
<Route path="/pedidos_fruver" element={<PrivateRoute><Layout><PedidosFruver /></Layout></PrivateRoute>} />
<Route path="/actualizar_planos" element={<PrivateRoute><Layout><ActualizarPlanos /></Layout></PrivateRoute>} />
<Route path="/reporte_ventas" element={<PrivateRoute><Layout><Financiero /></Layout></PrivateRoute>} />
<Route path="/bitacora" element={<PrivateRoute><Layout><Bitacora /></Layout></PrivateRoute>} />
<Route path="/cvm" element={<PrivateRoute><Layout><CVM /></Layout></PrivateRoute>} />
<Route path="/programacion_pos" element={<PrivateRoute><Layout><ProgramacionPOS /></Layout></PrivateRoute>} />
<Route path="/separata" element={<PrivateRoute><Layout><Separata /></Layout></PrivateRoute>} />

```

Revisar las funciones disponbiles y las acciones rapidas, ya que van a acambiar dependiendo del usuario y se van a agregar diferentes.

en usuario cambiar  el llamado de la sede, area, cargo, ya el de nombres completos y correo eletronico estan funcionales
