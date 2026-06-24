-- ==========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Inventario de Farmacia
-- ==========================================

-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS farmacia_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmacia_inventario;

-- 2. Eliminar la tabla si ya existe para evitar conflictos al re-ejecutar
DROP TABLE IF EXISTS productos;

-- 3. Crear la tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Insertar datos de prueba para inicializar el sistema
INSERT INTO productos (codigo, nombre, cantidad, precio_venta) VALUES
('P001', 'Paracetamol 500mg (Caja x 20 comprimidos)', 120, 1.50),
('P002', 'Ibuprofeno 400mg (Caja x 10 cápsulas)', 85, 2.20),
('P003', 'Amoxicilina 500mg (Suspensión oral)', 40, 8.75),
('P004', 'Loratadina 10mg (Caja x 30 comprimidos)', 150, 3.40),
('P005', 'Omeprazol 20mg (Caja x 28 cápsulas)', 65, 4.90),
('P006', 'Vitamina C 1g (Tubo efervescente x 10)', 200, 5.15),
('P007', 'Aspirina 100mg (Caja x 100 comprimidos)', 5, 6.80), -- Stock bajo para prueba de alertas
('P008', 'Alcohol en Gel 250ml', 0, 2.50); -- Stock agotado para probar visualización
