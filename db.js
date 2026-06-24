require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farmacia_inventario',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para testear la conexión inicial al arrancar el servidor
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión establecida con éxito a la base de datos MySQL.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos MySQL:', error.message);
    console.error('Por favor, asegúrate de que MySQL esté ejecutándose y de haber creado la base de datos con "database.sql".');
  }
}

testConnection();

module.exports = pool;
