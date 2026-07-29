// ============ REFERENCIAS A ELEMENTOS DOM ============
const DOM = {
    tablaBody: document.getElementById('tablaBody'),
    totalItems: document.getElementById('totalItems'),
    totalStats: document.getElementById('totalStats'),
    disponiblesStats: document.getElementById('disponiblesStats'),
    asignadosStats: document.getElementById('asignadosStats'),
    reparacionStats: document.getElementById('reparacionStats'),
    searchInput: document.getElementById('searchInput'),
    filterTipo: document.getElementById('filterTipo'),
    filterEstado: document.getElementById('filterEstado'),
    btnLimpiarFiltros: document.getElementById('btnLimpiarFiltros'),
    itemsMostrados: document.getElementById('itemsMostrados'),
    modalForm: document.getElementById('modalForm'),
    modalConfirmar: document.getElementById('modalConfirmar'),
    modalTitle: document.getElementById('modalTitle'),
    editId: document.getElementById('editId'),
    formTipo: document.getElementById('formTipo'),
    formMarca: document.getElementById('formMarca'),
    formModelo: document.getElementById('formModelo'),
    formSerial: document.getElementById('formSerial'),
    formUbicacion: document.getElementById('formUbicacion'),
    formEstado: document.getElementById('formEstado'),
    btnAgregar: document.getElementById('btnAgregar'),
    btnGuardar: document.getElementById('btnGuardar'),
    btnCancelar: document.getElementById('btnCancelar'),
    btnCerrarModal: document.getElementById('btnCerrarModal'),
    confirmarSerial: document.getElementById('confirmarSerial'),
    btnConfirmarEliminar: document.getElementById('btnConfirmarEliminar'),
    btnCancelarEliminar: document.getElementById('btnCancelarEliminar'),
    btnCerrarConfirmar: document.getElementById('btnCerrarConfirmar'),
    toastContainer: document.getElementById('toastContainer'),
    deviceForm: document.getElementById('deviceForm')
};

// ============ FUNCIONES DE RENDERIZADO ============

function renderizarInventario(items) {
    const datos = items || inventario;
    
    actualizarEstadisticas(datos);
    
    if (datos.length === 0) {
        DOM.tablaBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-box-open" style="font-size: 2rem; display: block; margin-bottom: 8px;"></i>
                    No hay dispositivos registrados
                </td>
            </tr>
        `;
        DOM.itemsMostrados.textContent = 'Mostrando 0 items';
        return;
    }
    
    let html = '';
    datos.forEach(item => {
        html += `
            <tr>
                <td><strong>#${item.id}</strong></td>
                <td>${item.tipo}</td>
                <td>${item.marca}</td>
                <td>${item.modelo}</td>
                <td><code style="background: var(--background); padding: 2px 8px; border-radius: 4px; font-size: 0.85rem;">${item.serial}</code></td>
                <td>${item.ubicacion || 'N/A'}</td>
                <td><span class="estado-badge estado-${item.estado}">${item.estado}</span></td>
                <td>
                    <div class="acciones-btns">
                        <button class="btn-icon btn-edit" onclick="editarDispositivo(${item.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmarEliminar(${item.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    DOM.tablaBody.innerHTML = html;
    DOM.totalItems.textContent = datos.length;
    DOM.itemsMostrados.textContent = `Mostrando ${datos.length} items`;
}

function actualizarEstadisticas(datos) {
    const total = datos.length;
    const disponibles = datos.filter(d => d.estado === 'Disponible').length;
    const asignados = datos.filter(d => d.estado === 'Asignado').length;
    const reparacion = datos.filter(d => d.estado === 'Reparación').length;
    
    DOM.totalStats.textContent = total;
    DOM.disponiblesStats.textContent = disponibles;
    DOM.asignadosStats.textContent = asignados;
    DOM.reparacionStats.textContent = reparacion;
}

// ============ FILTROS Y BÚSQUEDA ============

function aplicarFiltros() {
    const searchTerm = DOM.searchInput.value.toLowerCase();
    const tipoFiltro = DOM.filterTipo.value;
    const estadoFiltro = DOM.filterEstado.value;
    
    let filtrados = inventario;
    
    if (searchTerm) {
        filtrados = filtrados.filter(item =>
            item.serial.toLowerCase().includes(searchTerm) ||
            item.modelo.toLowerCase().includes(searchTerm) ||
            item.marca.toLowerCase().includes(searchTerm) ||
            item.tipo.toLowerCase().includes(searchTerm) ||
            item.ubicacion.toLowerCase().includes(searchTerm)
        );
    }
    
    if (tipoFiltro) {
        filtrados = filtrados.filter(item => item.tipo === tipoFiltro);
    }
    
    if (estadoFiltro) {
        filtrados = filtrados.filter(item => item.estado === estadoFiltro);
    }
    
    renderizarInventario(filtrados);
}

// ============ CRUD ============

function agregarDispositivo(dispositivo) {
    const nuevo = crearDispositivo(dispositivo);
    if (nuevo) {
        aplicarFiltros();
        mostrarToast('Dispositivo agregado correctamente', 'success');
    }
}

function editarDispositivo(id) {
    const item = obtenerPorId(id);
    if (!item) {
        mostrarToast('Dispositivo no encontrado', 'error');
        return;
    }
    
    DOM.modalTitle.textContent = 'Editar Dispositivo';
    DOM.editId.value = id;
    DOM.formTipo.value = item.tipo;
    DOM.formMarca.value = item.marca;
    DOM.formModelo.value = item.modelo;
    DOM.formSerial.value = item.serial;
    DOM.formUbicacion.value = item.ubicacion || '';
    DOM.formEstado.value = item.estado;
    
    abrirModal(DOM.modalForm);
}

function actualizarDispositivo(id, datos) {
    const actualizado = actualizarDispositivoDB(id, datos);
    if (actualizado) {
        aplicarFiltros();
        mostrarToast('Dispositivo actualizado correctamente', 'success');
    }
}

function confirmarEliminar(id) {
    const item = obtenerPorId(id);
    if (!item) {
        mostrarToast('Dispositivo no encontrado', 'error');
        return;
    }
    
    DOM.confirmarSerial.textContent = `${item.marca} ${item.modelo} (${item.serial})`;
    DOM.btnConfirmarEliminar.dataset.id = id;
    abrirModal(DOM.modalConfirmar);
}

function eliminarDispositivo(id) {
    const eliminado = eliminarDispositivoDB(id);
    if (eliminado) {
        aplicarFiltros();
        mostrarToast('Dispositivo eliminado correctamente', 'warning');
        cerrarModal(DOM.modalConfirmar);
    }
}

// ============ MODALES ============

function abrirModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    if (modal === DOM.modalForm) {
        DOM.deviceForm.reset();
        DOM.editId.value = '';
        DOM.modalTitle.textContent = 'Agregar Dispositivo';
    }
}

// ============ TOAST ============

function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${iconos[tipo] || iconos.info}"></i>
        <span>${mensaje}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ EVENTOS PRINCIPALES ============

// Agregar nuevo dispositivo
DOM.btnAgregar.addEventListener('click', () => {
    DOM.modalTitle.textContent = 'Agregar Dispositivo';
    DOM.editId.value = '';
    DOM.deviceForm.reset();
    abrirModal(DOM.modalForm);
});

// Guardar formulario
DOM.deviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = parseInt(DOM.editId.value);
    const datos = {
        tipo: DOM.formTipo.value,
        marca: DOM.formMarca.value,
        modelo: DOM.formModelo.value,
        serial: DOM.formSerial.value,
        ubicacion: DOM.formUbicacion.value,
        estado: DOM.formEstado.value
    };
    
    if (!datos.tipo || !datos.marca || !datos.modelo || !datos.serial) {
        mostrarToast('Todos los campos obligatorios deben estar llenos', 'error');
        return;
    }
    
    if (id) {
        actualizarDispositivo(id, datos);
    } else {
        agregarDispositivo(datos);
    }
    
    cerrarModal(DOM.modalForm);
});

// Cancelar / Cerrar modal
DOM.btnCancelar.addEventListener('click', () => cerrarModal(DOM.modalForm));
DOM.btnCerrarModal.addEventListener('click', () => cerrarModal(DOM.modalForm));

// Confirmar eliminar
DOM.btnConfirmarEliminar.addEventListener('click', () => {
    const id = parseInt(DOM.btnConfirmarEliminar.dataset.id);
    eliminarDispositivo(id);
});

DOM.btnCancelarEliminar.addEventListener('click', () => cerrarModal(DOM.modalConfirmar));
DOM.btnCerrarConfirmar.addEventListener('click', () => cerrarModal(DOM.modalConfirmar));

// Limpiar filtros
DOM.btnLimpiarFiltros.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.filterTipo.value = '';
    DOM.filterEstado.value = '';
    aplicarFiltros();
});

// Búsqueda en tiempo real
let timeoutBusqueda;
DOM.searchInput.addEventListener('input', () => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(aplicarFiltros, 300);
});

// Filtros
DOM.filterTipo.addEventListener('change', aplicarFiltros);
DOM.filterEstado.addEventListener('change', aplicarFiltros);

// ============ BOTONES EXPORTAR ============

const btnExportarDropdown = document.getElementById('btnExportarDropdown');
const dropdownExportar = document.getElementById('dropdownExportar');

if (btnExportarDropdown && dropdownExportar) {
    btnExportarDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownExportar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-group')) {
            dropdownExportar.classList.remove('active');
        }
    });
}

// Exportar JSON
const btnExportarJSON = document.getElementById('btnExportarJSON');
if (btnExportarJSON) {
    btnExportarJSON.addEventListener('click', () => {
        exportarDatos();
        dropdownExportar.classList.remove('active');
    });
}

// Exportar CSV
const btnExportarCSV = document.getElementById('btnExportarCSV');
if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', () => {
        exportarCSV();
        dropdownExportar.classList.remove('active');
    });
}

// Exportar Excel
const btnExportarExcel = document.getElementById('btnExportarExcel');
if (btnExportarExcel) {
    btnExportarExcel.addEventListener('click', () => {
        exportarExcel();
        dropdownExportar.classList.remove('active');
    });
}

// ============ IMPORTAR JSON ============

const btnImportar = document.getElementById('btnImportar');
if (btnImportar) {
    btnImportar.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await importarDatos(file);
                aplicarFiltros();
            } catch (error) {
                console.error('Error al importar:', error);
            }
        };
        input.click();
    });
}

// ============ IMPORTAR EXCEL ============

const btnImportarExcel = document.getElementById('btnImportarExcel');

if (btnImportarExcel) {
    btnImportarExcel.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                // Verificar que la función existe
                if (typeof importarExcel !== 'function') {
                    mostrarToast('Error: Función importarExcel no definida', 'error');
                    console.error('La función importarExcel no está definida en data.js');
                    return;
                }
                
                const resultado = await importarExcel(file);
                
                if (resultado && resultado.dispositivos.length > 0) {
                    // Preguntar si quiere reemplazar o agregar
                    const reemplazar = confirm(
                        `📊 Se encontraron ${resultado.importados} dispositivos válidos para importar.\n` +
                        `📦 Dispositivos actuales: ${inventario.length}\n\n` +
                        `¿Quieres REEMPLAZAR todo el inventario?\n` +
                        `(Cancelar = Agregar al inventario existente)`
                    );
                    
                    if (reemplazar) {
                        // Reemplazar todo
                        inventario = resultado.dispositivos;
                        mostrarToast(`Importados ${resultado.importados} dispositivos (reemplazo total)`, 'success');
                    } else {
                        // Agregar al existente
                        const serialesExistentes = new Set(inventario.map(d => d.serial));
                        const nuevos = resultado.dispositivos.filter(d => !serialesExistentes.has(d.serial));
                        
                        if (nuevos.length === 0) {
                            mostrarToast('⚠️ Todos los dispositivos ya existen en el inventario', 'warning');
                            return;
                        }
                        
                        // Actualizar IDs
                        const maxId = Math.max(...inventario.map(d => d.id), 0);
                        nuevos.forEach((d, index) => {
                            d.id = maxId + index + 1;
                        });
                        
                        inventario = [...inventario, ...nuevos];
                        mostrarToast(`✅ Importados ${nuevos.length} dispositivos nuevos de Excel`, 'success');
                    }
                    
                    // Actualizar nextId
                    if (inventario.length > 0) {
                        nextId = Math.max(...inventario.map(item => item.id)) + 1;
                    }
                    
                    guardarInventario();
                    aplicarFiltros();
                }
                
            } catch (error) {
                console.error('Error al importar Excel:', error);
                mostrarToast('Error al importar Excel: ' + (error.message || 'Error desconocido'), 'error');
            }
        };
        
        input.click();
    });
    
    console.log('✅ Botón Importar Excel configurado');
} else {
    console.warn('⚠️ No se encontró el botón btnImportarExcel en el HTML');
}

// ============ FIN DEL ARCHIVO ============

console.log('✅ UI cargada correctamente');