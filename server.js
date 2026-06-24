const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend desde la raíz del proyecto
app.use(express.static(__dirname));

// =========================================================================
// RUTAS DE LA API REST
// =========================================================================

/**
 * GET /productos
 * Retorna todos los productos del inventario ordenados por fecha de creación descendente.
 */
app.get('/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener productos' });
  }
});

/**
 * GET /productos/buscar
 * Busca productos por código o nombre (coincidencias parciales, insensible a mayúsculas/minúsculas).
 * Query param: ?query=texto
 */
app.get('/productos/buscar', async (req, res) => {
  const { query } = req.query;
  
  if (query === undefined || query === null) {
    return res.status(400).json({ error: 'El parámetro de búsqueda "query" es requerido' });
  }

  const searchTerm = `%${query.trim()}%`;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM productos WHERE codigo LIKE ? OR nombre LIKE ? ORDER BY fecha_creacion DESC',
      [searchTerm, searchTerm]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ error: 'Error interno del servidor al buscar productos' });
  }
});

/**
 * POST /productos
 * Registra un nuevo producto en el inventario.
 */
app.post('/productos', async (req, res) => {
  let { codigo, nombre, cantidad, precio_venta } = req.body;

  // 1. Validaciones básicas en el backend
  if (!codigo || String(codigo).trim() === '') {
    return res.status(400).json({ error: 'Complete todos los campos: El código del producto no puede estar vacío.' });
  }
  if (!nombre || String(nombre).trim() === '') {
    return res.status(400).json({ error: 'Complete todos los campos: El nombre del producto no puede estar vacío.' });
  }
  
  codigo = String(codigo).trim();
  nombre = String(nombre).trim();

  // Validar cantidad (entero >= 0)
  const qtyInt = parseInt(cantidad, 10);
  if (isNaN(qtyInt) || qtyInt < 0) {
    return res.status(400).json({ error: 'La cantidad no puede ser negativa y debe ser un número entero válido.' });
  }

  // Validar precio de venta (número > 0)
  const priceFloat = parseFloat(precio_venta);
  if (isNaN(priceFloat) || priceFloat <= 0) {
    return res.status(400).json({ error: 'El precio de venta debe ser un número mayor a 0.' });
  }

  try {
    // 2. Validar que el código no esté duplicado
    const [existing] = await db.execute('SELECT id FROM productos WHERE codigo = ?', [codigo]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El código del producto ya existe en el inventario.' });
    }

    // 3. Insertar el nuevo producto
    const [result] = await db.execute(
      'INSERT INTO productos (codigo, nombre, cantidad, precio_venta) VALUES (?, ?, ?, ?)',
      [codigo, nombre, qtyInt, priceFloat]
    );

    res.status(201).json({
      message: 'Producto registrado correctamente.',
      id: result.insertId,
      codigo,
      nombre,
      cantidad: qtyInt,
      precio_venta: priceFloat
    });

  } catch (error) {
    console.error('Error al registrar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el producto.' });
  }
});

/**
 * PUT /productos/:id
 * Actualiza los datos de un producto (nombre, cantidad, precio_venta). El código no se modifica.
 */
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  let { nombre, cantidad, precio_venta } = req.body;

  // 1. Validaciones en el backend
  if (!nombre || String(nombre).trim() === '') {
    return res.status(400).json({ error: 'Complete todos los campos: El nombre del producto no puede estar vacío.' });
  }
  
  nombre = String(nombre).trim();

  // Validar cantidad (entero >= 0)
  const qtyInt = parseInt(cantidad, 10);
  if (isNaN(qtyInt) || qtyInt < 0) {
    return res.status(400).json({ error: 'La cantidad no puede ser negativa y debe ser un número entero válido.' });
  }

  // Validar precio de venta (número > 0)
  const priceFloat = parseFloat(precio_venta);
  if (isNaN(priceFloat) || priceFloat <= 0) {
    return res.status(400).json({ error: 'El precio de venta debe ser un número mayor a 0.' });
  }

  try {
    // 2. Verificar si el producto a editar existe
    const [existing] = await db.execute('SELECT id FROM productos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El producto a editar no existe en el inventario.' });
    }

    // 3. Ejecutar la actualización (se mantiene el código original de forma segura)
    await db.execute(
      'UPDATE productos SET nombre = ?, cantidad = ?, precio_venta = ? WHERE id = ?',
      [nombre, qtyInt, priceFloat, id]
    );

    res.json({
      message: 'Producto actualizado correctamente.',
      id: parseInt(id),
      nombre,
      cantidad: qtyInt,
      precio_venta: priceFloat
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el producto.' });
  }
});

/**
 * DELETE /productos/:id
 * Elimina un producto por su ID del inventario.
 */
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verificar si el producto a eliminar existe
    const [existing] = await db.execute('SELECT id, nombre FROM productos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El producto a eliminar no existe en el inventario.' });
    }

    // 2. Ejecutar la eliminación
    await db.execute('DELETE FROM productos WHERE id = ?', [id]);

    res.json({
      message: 'Producto eliminado correctamente.',
      deletedName: existing[0].nombre
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el producto.' });
  }
});

// Ruta comodín para redirigir cualquier otra petición al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de inventario corriendo en http://localhost:${PORT}`);
});
