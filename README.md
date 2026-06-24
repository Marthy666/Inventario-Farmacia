# Sistema de Inventario de Farmacia 💊

Este es un sistema web moderno y responsivo para el control y administración del inventario de productos farmacéuticos. La aplicación cuenta con una arquitectura de dos capas (Frontend y Backend) y se conecta a una base de datos relacional MySQL.

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos sencillos pasos para instalar y poner en marcha el sistema en tu máquina local:

### Paso 1: Instalar Node.js
Como observamos que no tienes Node.js configurado en tu terminal actual, primero debes instalarlo:
1. Ve al sitio oficial de Node.js: [https://nodejs.org](https://nodejs.org/)
2. Descarga la versión **LTS** recomendada para tu sistema operativo (Windows).
3. Ejecuta el instalador descargado y sigue el asistente (deja las opciones predeterminadas marcadas).
4. Al finalizar la instalación, **reinicia tu terminal** o editor de código (como VS Code) para que los comandos `node` y `npm` sean reconocidos en la consola.

---

### Paso 2: Crear la Base de Datos en MySQL Workbench
1. Abre **MySQL Workbench** e inicia sesión en tu conexión local (usualmente con el usuario `root`).
2. Abre una nueva pestaña de consultas SQL (`File -> New Query Tab` o haz clic en el icono del archivo con un rayo).
3. Abre el archivo **`database.sql`** que se encuentra en la carpeta del proyecto o copia su contenido.
4. Pega el script completo en la pestaña de consultas de MySQL Workbench.
5. Ejecuta todo el script presionando el icono del rayo (**Execute the selected portion of the script** o presiona `Ctrl + Shift + Enter`).
6. En el panel izquierdo "Schemas", haz clic derecho y selecciona **Refresh All**. Verás aparecer la base de datos `farmacia_inventario` y la tabla `productos` con datos iniciales listos para usar.

---

### Paso 3: Instalar las Dependencias de Node.js
1. Abre tu terminal (PowerShell, Command Prompt o la integrada en tu editor de código) en la ruta del proyecto:
   ```powershell
   cd "C:\Users\marth\OneDrive\Desktop\Paginas"
   ```
2. Ejecuta el siguiente comando para instalar Express, MySQL2, CORS y dotenv:
   ```bash
   npm install
   ```

---

### Paso 4: Configurar Credenciales en `.env` (Opcional)
Abrimos un archivo llamado `.env` en la raíz del proyecto. Si tu MySQL tiene credenciales específicas (como contraseña), puedes editarlo:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui    # <-- Agrega aquí tu contraseña de MySQL si la tienes
DB_NAME=farmacia_inventario
DB_PORT=3306
```

---

### Paso 5: Ejecutar el Servidor
En tu terminal, ejecuta el comando para iniciar el servidor de desarrollo:
```bash
npm start
```
*También puedes usar `npm run dev` si deseas que el servidor se reinicie automáticamente al hacer cambios en el código.*

Deberías ver los siguientes mensajes en la consola:
```text
✅ Conexión establecida con éxito a la base de datos MySQL.
🚀 Servidor de inventario corriendo en http://localhost:3000
```

---

### Paso 6: Abrir la Aplicación en el Navegador
1. Abre tu navegador web favorito (Chrome, Edge, Firefox, etc.).
2. Ingresa a la siguiente dirección en la barra de búsqueda:
   ```text
   http://localhost:3000
   ```
3. ¡Listo! Ya puedes empezar a registrar, editar, buscar y eliminar medicamentos del inventario.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5 (estructura semántica), CSS3 (diseño moderno con variables CSS, transiciones fluidas, Flexbox, Grid y diseño totalmente responsivo), y JavaScript (fetch API asíncrono y manipulación del DOM).
- **Backend:** Node.js con el framework Express.
- **Base de datos:** MySQL (consultas seguras preparadas con `mysql2` para evitar inyección SQL).
- **Iconografía:** Lucide Icons.
