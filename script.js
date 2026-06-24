// =========================================================================
// LÓGICA DE CLIENTE (FRONTEND) - INVENTARIO DE FARMACIA
// =========================================================================

// Configuración de la API Base URL (vacio por ser del mismo origen)
const API_URL = '';

// Estado de la Aplicación
let state = {
  products: [],
  editingId: null,
  deletingId: null,
  searchQuery: ''
};

// Selectores DOM
const productForm = document.getElementById('product-form');
const formCard = document.getElementById('form-card');
const formTitle = document.getElementById('form-title');
const formDesc = document.getElementById('form-desc');
const btnSubmitText = document.getElementById('btn-submit-text');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');

// Inputs del Formulario
const inputId = document.getElementById('product-id');
const inputCodigo = document.getElementById('codigo');
const inputNombre = document.getElementById('nombre');
const inputCantidad = document.getElementById('cantidad');
const inputPrecio = document.getElementById('precio_venta');

// Elementos de la Tabla y Búsqueda
const tableBody = document.getElementById('products-table-body');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');

// Elementos de Estadísticas (KPIs)
const kpiTotalProducts = document.getElementById('kpi-total-products');
const kpiLowStock = document.getElementById('kpi-low-stock');
const kpiTotalValue = document.getElementById('kpi-total-value');
const lowStockKpiBox = document.getElementById('low-stock-kpi-box');

// Elementos del Modal de Eliminación
const deleteModal = document.getElementById('delete-modal');
const deleteProductNameSpan = document.getElementById('delete-product-name');
const btnDeleteConfirm = document.getElementById('btn-delete-confirm');
const btnDeleteCancel = document.getElementById('btn-delete-cancel');

// Contenedor de Toasts
const toastContainer = document.getElementById('toast-container');

// =========================================================================
// INICIALIZACIÓN
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos por primera vez
  fetchProducts();
  
  // Registrar Listeners
  productForm.addEventListener('submit', handleFormSubmit);
  btnCancel.addEventListener('click', exitEditingMode);
  
  // Buscador con debounce simple
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    toggleClearSearchButton();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (state.searchQuery.trim() !== '') {
        searchProducts(state.searchQuery);
      } else {
        fetchProducts();
      }
    }, 300);
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    toggleClearSearchButton();
    fetchProducts();
  });

  // Modal de Eliminación
  btnDeleteCancel.addEventListener('click', closeDeleteModal);
  btnDeleteConfirm.addEventListener('click', confirmDeleteProduct);
  
  // Cerrar modal al hacer clic fuera del card
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Renderizar iconos iniciales
  lucide.createIcons();
});

// =========================================================================
// SERVICIOS API (LLAMADAS AJAX)
// =========================================================================

// Obtener todos los productos
async function fetchProducts() {
  showTableLoading();
  try {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al obtener la lista de productos.');
    const data = await response.json();
    state.products = data;
    renderInventory();
  } catch (error) {
    showToast(error.message, 'error');
    showTableError();
  }
}

// Buscar productos
async function searchProducts(query) {
  showTableLoading();
  try {
    const response = await fetch(`${API_URL}/productos/buscar?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Error al buscar productos.');
    const data = await response.json();
    state.products = data;
    renderInventory();
  } catch (error) {
    showToast(error.message, 'error');
    showTableError();
  }
}

// Crear producto
async function createProduct(productData) {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'No se pudo registrar el producto.');
    }
    
    showToast(result.message || 'Producto registrado correctamente.', 'success');
    resetForm();
    fetchProducts(); // Recargar tabla
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Actualizar producto
async function updateProduct(id, productData) {
  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'No se pudo actualizar el producto.');
    }
    
    showToast(result.message || 'Producto actualizado correctamente.', 'success');
    exitEditingMode();
    fetchProducts(); // Recargar tabla
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Eliminar producto
async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'No se pudo eliminar el producto.');
    }
    
    showToast(result.message || 'Producto eliminado correctamente.', 'success');
    fetchProducts(); // Recargar tabla
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// =========================================================================
// LÓGICA DE RENDERIZACIÓN (FRONTEND)
// =========================================================================

function renderInventory() {
  // Limpiar cuerpo de la tabla
  tableBody.innerHTML = '';

  // Actualizar estadísticas rápidas basándose en la lista actual
  updateStatistics(state.products);

  if (state.products.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  state.products.forEach(product => {
    const tr = document.createElement('tr');
    tr.id = `product-row-${product.id}`;

    // Formatear precio
    const precioFormateado = parseFloat(product.precio_venta).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Determinar badge de stock
    let badgeClass = 'normal';
    let badgeText = `Disponible: ${product.cantidad}`;
    
    if (product.cantidad === 0) {
      badgeClass = 'out';
      badgeText = 'Agotado';
    } else if (product.cantidad < 10) {
      badgeClass = 'low';
      badgeText = `Bajo Stock: ${product.cantidad}`;
    }

    tr.innerHTML = `
      <td><span class="col-codigo">${escapeHTML(product.codigo)}</span></td>
      <td><span class="col-nombre">${escapeHTML(product.nombre)}</span></td>
      <td class="text-right">
        <span class="badge-stock ${badgeClass}">${badgeText}</span>
      </td>
      <td class="text-right col-precio">$${precioFormateado}</td>
      <td class="text-center">
        <div class="action-buttons">
          <button class="btn-icon edit" onclick="enterEditingMode(${product.id})" title="Editar producto">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn-icon delete" onclick="openDeleteModal(${product.id})" title="Eliminar producto">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Re-renderizar iconos de Lucide
  lucide.createIcons();
}

function updateStatistics(productsList) {
  kpiTotalProducts.textContent = productsList.length;

  // Stock crítico (cantidad < 10)
  const lowStockCount = productsList.filter(p => p.cantidad < 10).length;
  kpiLowStock.textContent = lowStockCount;

  if (lowStockCount > 0) {
    lowStockKpiBox.classList.add('alert-active');
  } else {
    lowStockKpiBox.classList.remove('alert-active');
  }

  // Valor estimado total
  const totalValue = productsList.reduce((sum, p) => {
    return sum + (parseInt(p.cantidad) * parseFloat(p.precio_venta));
  }, 0);

  kpiTotalValue.textContent = '$' + totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function showTableLoading() {
  emptyState.classList.add('hidden');
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="table-loading">
        <div class="spinner"></div>
        Cargando inventario...
      </td>
    </tr>
  `;
}

function showTableError() {
  emptyState.classList.add('hidden');
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="table-loading text-danger">
        <i data-lucide="alert-circle" style="width:32px; height:32px; color:var(--error-color); margin: 0 auto 12px; display:block;"></i>
        Error de conexión con el servidor. Intentando reconectar...
      </td>
    </tr>
  `;
  lucide.createIcons();
}

function toggleClearSearchButton() {
  if (state.searchQuery.trim() !== '') {
    btnClearSearch.classList.remove('hidden');
  } else {
    btnClearSearch.classList.add('hidden');
  }
}

// =========================================================================
// MODO EDICIÓN & CONTROL DE FORMULARIO
// =========================================================================

function enterEditingMode(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.editingId = productId;

  // Llenar campos
  inputId.value = product.id;
  inputCodigo.value = product.codigo;
  inputCodigo.disabled = true; // El código no debe modificarse según requerimientos
  inputNombre.value = product.nombre;
  inputCantidad.value = product.cantidad;
  inputPrecio.value = product.precio_venta;

  // Limpiar errores visuales
  clearAllValidationErrors();

  // Modificar interfaz del formulario
  formCard.classList.add('editing-mode');
  formTitle.innerHTML = '<i data-lucide="edit-3" class="title-icon"></i> Editar Producto';
  formDesc.textContent = 'Modifique los atributos de venta o stock del producto.';
  btnSubmitText.textContent = 'Guardar Cambios';
  btnSubmit.classList.add('editing');
  btnCancel.classList.remove('hidden');

  // Desplazar vista al formulario
  formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  lucide.createIcons();
}

function exitEditingMode() {
  state.editingId = null;
  resetForm();

  // Restaurar interfaz de formulario
  formCard.classList.remove('editing-mode');
  formTitle.innerHTML = '<i data-lucide="file-plus" class="title-icon"></i> Registrar Producto';
  formDesc.textContent = 'Complete los datos para agregar un nuevo medicamento.';
  btnSubmitText.textContent = 'Guardar Producto';
  btnSubmit.classList.remove('editing');
  btnCancel.classList.add('hidden');

  lucide.createIcons();
}

function resetForm() {
  productForm.reset();
  inputId.value = '';
  inputCodigo.disabled = false;
  clearAllValidationErrors();
}

// =========================================================================
// VALIDACIONES DE FORMULARIO
// =========================================================================

function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Por favor, corrija los errores en el formulario.', 'warning');
    return;
  }

  const productData = {
    codigo: inputCodigo.value.trim(),
    nombre: inputNombre.value.trim(),
    cantidad: parseInt(inputCantidad.value.trim(), 10),
    precio_venta: parseFloat(inputPrecio.value.trim())
  };

  if (state.editingId) {
    // Modo Edición
    updateProduct(state.editingId, productData);
  } else {
    // Modo Registro
    createProduct(productData);
  }
}

function validateForm() {
  let isValid = true;

  // 1. Validar Código (solo si no estamos editando)
  if (!state.editingId) {
    const valCodigo = inputCodigo.value.trim();
    if (!valCodigo) {
      setFieldError(inputCodigo, 'El código del producto no puede estar vacío.');
      isValid = false;
    } else if (valCodigo.length > 50) {
      setFieldError(inputCodigo, 'El código no puede superar los 50 caracteres.');
      isValid = false;
    } else {
      clearFieldError(inputCodigo);
    }
  }

  // 2. Validar Nombre
  const valNombre = inputNombre.value.trim();
  if (!valNombre) {
    setFieldError(inputNombre, 'El nombre del producto no puede estar vacío.');
    isValid = false;
  } else if (valNombre.length > 150) {
    setFieldError(inputNombre, 'El nombre no puede superar los 150 caracteres.');
    isValid = false;
  } else {
    clearFieldError(inputNombre);
  }

  // 3. Validar Cantidad
  const valCantidad = inputCantidad.value.trim();
  const cantInt = parseInt(valCantidad, 10);
  if (!valCantidad) {
    setFieldError(inputCantidad, 'La cantidad no puede estar vacía.');
    isValid = false;
  } else if (isNaN(cantInt) || cantInt < 0) {
    setFieldError(inputCantidad, 'La cantidad no puede ser negativa.');
    isValid = false;
  } else if (parseFloat(valCantidad) !== cantInt) {
    setFieldError(inputCantidad, 'La cantidad debe ser un número entero.');
    isValid = false;
  } else {
    clearFieldError(inputCantidad);
  }

  // 4. Validar Precio de Venta
  const valPrecio = inputPrecio.value.trim();
  const precioFloat = parseFloat(valPrecio);
  if (!valPrecio) {
    setFieldError(inputPrecio, 'El precio de venta no puede estar vacío.');
    isValid = false;
  } else if (isNaN(precioFloat) || precioFloat <= 0) {
    setFieldError(inputPrecio, 'El precio de venta debe ser un número mayor a 0.');
    isValid = false;
  } else {
    clearFieldError(inputPrecio);
  }

  return isValid;
}

function setFieldError(inputElement, message) {
  const wrapper = inputElement.closest('.input-wrapper');
  const errorMsg = wrapper.nextElementSibling;
  
  wrapper.classList.add('error');
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
}

function clearFieldError(inputElement) {
  const wrapper = inputElement.closest('.input-wrapper');
  const errorMsg = wrapper.nextElementSibling;
  
  wrapper.classList.remove('error');
  errorMsg.style.display = 'none';
  errorMsg.textContent = '';
}

function clearAllValidationErrors() {
  const inputs = [inputCodigo, inputNombre, inputCantidad, inputPrecio];
  inputs.forEach(input => clearFieldError(input));
}

// =========================================================================
// MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// =========================================================================

function openDeleteModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.deletingId = productId;
  deleteProductNameSpan.textContent = product.nombre;
  
  deleteModal.classList.remove('hidden');
  deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  deleteModal.setAttribute('aria-hidden', 'true');
  state.deletingId = null;
}

function confirmDeleteProduct() {
  if (state.deletingId) {
    deleteProduct(state.deletingId);
    closeDeleteModal();
  }
}

// =========================================================================
// SISTEMA DE NOTIFICACIONES (TOASTS)
// =========================================================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Icono del Toast
  let iconName = 'check-circle';
  if (type === 'error') iconName = 'x-circle';
  if (type === 'warning') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <div class="toast-content">${escapeHTML(message)}</div>
    <button class="toast-close" onclick="this.parentElement.remove()" title="Cerrar">
      <i data-lucide="x" style="width:14px; height:14px;"></i>
    </button>
  `;

  toastContainer.appendChild(toast);
  lucide.createIcons();

  // Auto-eliminar el toast después de 4 segundos
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }
  }, 4000);
}

// =========================================================================
// HELPERS
// =========================================================================

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
