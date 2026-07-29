// ============ BASE DE DATOS LOCAL (localStorage) ============
const DB_KEY = 'inventario_ti';
const NEXT_ID_KEY = 'inventario_nextId';

// ============ VARIABLES GLOBALES ============
let inventario = [];
let nextId = 1;

// ============ FUNCIONES DE PERSISTENCIA ============

function cargarInventario() {
    try {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
            inventario = JSON.parse(data);
            inventario = inventario.filter(item => item.id !== undefined);
        } else {
            inventario = [
                {
                    id: 1,
                    tipo: 'Laptop',
                    marca: 'Dell',
                    modelo: 'Latitude 5420',
                    serial: 'DL-2024-001',
                    ubicacion: 'Oficina 3B',
                    estado: 'Disponible',
                    fecha_creacion: new Date().toISOString()
                },
                {
                    id: 2,
                    tipo: 'Monitor',
                    marca: 'Samsung',
                    modelo: 'LS24R350',
                    serial: 'SM-2024-045',
                    ubicacion: 'Bodega A',
                    estado: 'Asignado',
                    fecha_creacion: new Date().toISOString()
                },
                {
                    id: 3,
                    tipo: 'Computadora',
                    marca: 'HP',
                    modelo: 'EliteDesk 800',
                    serial: 'HP-2024-123',
                    ubicacion: 'Oficina 2A',
                    estado: 'Disponible',
                    fecha_creacion: new Date().toISOString()
                },
                {
                    id: 4,
                    tipo: 'Laptop',
                    marca: 'Lenovo',
                    modelo: 'ThinkPad T14',
                    serial: 'LN-2024-089',
                    ubicacion: 'Oficina 5C',
                    estado: 'Reparación',
                    fecha_creacion: new Date().toISOString()
                },
                {
                    id: 5,
                    tipo: 'Tablet',
                    marca: 'Apple',
                    modelo: 'iPad Pro 12.9',
                    serial: 'AP-2024-567',
                    ubicacion: 'Sala de Juntas',
                    estado: 'Asignado',
                    fecha_creacion: new Date().toISOString()
                }
            ];
            guardarInventario();
        }
        
        const savedNextId = localStorage.getItem(NEXT_ID_KEY);
        if (savedNextId) {
            nextId = parseInt(savedNextId);
        } else {
            nextId = inventario.length > 0 ? Math.max(...inventario.map(item => item.id)) + 1 : 1;
            localStorage.setItem(NEXT_ID_KEY, nextId.toString());
        }
        
        return inventario;
    } catch (error) {
        console.error('Error al cargar inventario:', error);
        inventario = [];
        nextId = 1;
        return [];
    }
}

function guardarInventario() {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(inventario));
        localStorage.setItem(NEXT_ID_KEY, nextId.toString());
        return true;
    } catch (error) {
        console.error('Error al guardar inventario:', error);
        return false;
    }
}

// ============ FUNCIONES CRUD ============

function obtenerTodos() {
    return inventario;
}

function obtenerPorId(id) {
    return inventario.find(item => item.id === id);
}

function crearDispositivo(dispositivo) {
    try {
        const { tipo, marca, modelo, serial, ubicacion, estado } = dispositivo;
        
        // ✅ Si el inventario está vacío, reiniciar nextId a 1
        if (inventario.length === 0) {
            nextId = 1;
            localStorage.setItem(NEXT_ID_KEY, nextId.toString());
        }
        
        if (!tipo || !marca || !modelo || !serial) {
            mostrarToast('Faltan campos obligatorios', 'error');
            return null;
        }
        
        const existe = inventario.find(item => item.serial === serial);
        if (existe) {
            mostrarToast(`El serial ${serial} ya está registrado`, 'error');
            return null;
        }
        
        const nuevo = {
            id: nextId++,
            tipo,
            marca,
            modelo,
            serial,
            ubicacion: ubicacion || '',
            estado: estado || 'Disponible',
            fecha_creacion: new Date().toISOString()
        };
        
        inventario.push(nuevo);
        guardarInventario();
        return nuevo;
        
    } catch (error) {
        console.error('Error al crear dispositivo:', error);
        mostrarToast('Error al crear el dispositivo', 'error');
        return null;
    }
}

function actualizarDispositivoDB(id, datos) {
    try {
        const index = inventario.findIndex(item => item.id === id);
        if (index === -1) {
            mostrarToast('Dispositivo no encontrado', 'error');
            return null;
        }
        
        const existente = inventario[index];
        
        if (datos.serial !== existente.serial) {
            const duplicado = inventario.find(item => 
                item.serial === datos.serial && item.id !== id
            );
            if (duplicado) {
                mostrarToast(`El serial ${datos.serial} ya está en uso`, 'error');
                return null;
            }
        }
        
        const actualizado = {
            ...existente,
            tipo: datos.tipo || existente.tipo,
            marca: datos.marca || existente.marca,
            modelo: datos.modelo || existente.modelo,
            serial: datos.serial || existente.serial,
            ubicacion: datos.ubicacion !== undefined ? datos.ubicacion : existente.ubicacion,
            estado: datos.estado || existente.estado
        };
        
        inventario[index] = actualizado;
        guardarInventario();
        return actualizado;
        
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error);
        mostrarToast('Error al actualizar el dispositivo', 'error');
        return null;
    }
}

function eliminarDispositivoDB(id) {
    try {
        const index = inventario.findIndex(item => item.id === id);
        if (index === -1) {
            mostrarToast('Dispositivo no encontrado', 'error');
            return null;
        }
        
        const eliminado = inventario[index];
        inventario.splice(index, 1);
        guardarInventario();
        
        // ✅ Si después de eliminar el inventario queda vacío, resetear nextId a 1
        if (inventario.length === 0) {
            nextId = 1;
            localStorage.setItem(NEXT_ID_KEY, nextId.toString());
        }
        
        return eliminado;
        
    } catch (error) {
        console.error('Error al eliminar dispositivo:', error);
        mostrarToast('Error al eliminar el dispositivo', 'error');
        return null;
    }
}

function buscarDispositivos(filtros = {}) {
    try {
        let resultados = inventario;
        const { tipo, estado, search } = filtros;
        
        if (tipo) {
            resultados = resultados.filter(item => 
                item.tipo.toLowerCase() === tipo.toLowerCase()
            );
        }
        
        if (estado) {
            resultados = resultados.filter(item => 
                item.estado.toLowerCase() === estado.toLowerCase()
            );
        }
        
        if (search) {
            const term = search.toLowerCase();
            resultados = resultados.filter(item =>
                item.serial.toLowerCase().includes(term) ||
                item.modelo.toLowerCase().includes(term) ||
                item.marca.toLowerCase().includes(term) ||
                item.tipo.toLowerCase().includes(term) ||
                (item.ubicacion && item.ubicacion.toLowerCase().includes(term))
            );
        }
        
        return resultados;
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarToast('Error al buscar', 'error');
        return [];
    }
}

function obtenerEstadisticas() {
    const total = inventario.length;
    const disponibles = inventario.filter(d => d.estado === 'Disponible').length;
    const asignados = inventario.filter(d => d.estado === 'Asignado').length;
    const reparacion = inventario.filter(d => d.estado === 'Reparación').length;
    const baja = inventario.filter(d => d.estado === 'Baja').length;
    
    const porTipo = {};
    inventario.forEach(item => {
        porTipo[item.tipo] = (porTipo[item.tipo] || 0) + 1;
    });
    
    return {
        total,
        disponibles,
        asignados,
        reparacion,
        baja,
        porTipo
    };
}

// ============ EXPORTAR E IMPORTAR ============

function exportarDatos() {
    try {
        if (inventario.length === 0) {
            mostrarToast('No hay datos para exportar', 'warning');
            return false;
        }

        const data = JSON.stringify(inventario, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarToast(`Exportados ${inventario.length} dispositivos a JSON`, 'success');
        return true;
        
    } catch (error) {
        console.error('Error al exportar JSON:', error);
        mostrarToast('Error al exportar los datos', 'error');
        return false;
    }
}

function exportarCSV() {
    try {
        if (inventario.length === 0) {
            mostrarToast('No hay datos para exportar', 'warning');
            return false;
        }

        const columnas = ['ID', 'Tipo', 'Marca', 'Modelo', 'Serial', 'Ubicación', 'Estado', 'Fecha Creación'];
        
        const filas = inventario.map(item => [
            item.id,
            item.tipo,
            item.marca,
            item.modelo,
            item.serial,
            item.ubicacion || 'N/A',
            item.estado,
            new Date(item.fecha_creacion).toLocaleDateString()
        ]);

        let csv = columnas.join(',') + '\n';
        filas.forEach(fila => {
            const filaEscapada = fila.map(campo => {
                if (typeof campo === 'string' && (campo.includes(',') || campo.includes('"') || campo.includes('\n'))) {
                    return `"${campo.replace(/"/g, '""')}"`;
                }
                return campo;
            });
            csv += filaEscapada.join(',') + '\n';
        });

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarToast(`Exportados ${inventario.length} dispositivos a CSV`, 'success');
        return true;

    } catch (error) {
        console.error('Error al exportar CSV:', error);
        mostrarToast('Error al exportar a CSV', 'error');
        return false;
    }
}

function exportarExcel() {
    try {
        if (inventario.length === 0) {
            mostrarToast('No hay datos para exportar', 'warning');
            return false;
        }

        let tablaHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:x="urn:schemas-microsoft-com:office:excel" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; font-family: Arial, sans-serif; }
                    th { background-color: #2563eb; color: white; padding: 8px; border: 1px solid #ddd; }
                    td { padding: 6px 8px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                </style>
            </head>
            <body>
                <h2>Inventario de Dispositivos TI</h2>
                <p>Fecha de exportación: ${new Date().toLocaleString()}</p>
                <p>Total de dispositivos: ${inventario.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Serial</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th>Fecha Creación</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        inventario.forEach(item => {
            tablaHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.tipo}</td>
                    <td>${item.marca}</td>
                    <td>${item.modelo}</td>
                    <td>${item.serial}</td>
                    <td>${item.ubicacion || 'N/A'}</td>
                    <td>${item.estado}</td>
                    <td>${new Date(item.fecha_creacion).toLocaleDateString()}</td>
                </tr>
            `;
        });

        tablaHTML += `
                    </tbody>
                </table>
                <p><em>Exportado desde Sistema de Inventario TI</em></p>
            </body>
            </html>
        `;

        const blob = new Blob([tablaHTML], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().slice(0,10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarToast(`Exportados ${inventario.length} dispositivos a Excel`, 'success');
        return true;

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        mostrarToast('Error al exportar a Excel', 'error');
        return false;
    }
}

function importarDatos(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(data)) {
                        mostrarToast('El archivo debe contener un array de dispositivos', 'error');
                        reject(new Error('Formato inválido'));
                        return;
                    }
                    
                    const validos = data.every(item => 
                        item.id && item.tipo && item.marca && item.modelo && item.serial
                    );
                    
                    if (!validos) {
                        mostrarToast('El archivo tiene formato incorrecto', 'error');
                        reject(new Error('Formato inválido'));
                        return;
                    }
                    
                    inventario = data;
                    
                    // ✅ Si el inventario importado está vacío, nextId = 1
                    if (inventario.length === 0) {
                        nextId = 1;
                    } else {
                        nextId = Math.max(...inventario.map(item => item.id)) + 1;
                    }
                    
                    guardarInventario();
                    mostrarToast(`Importados ${inventario.length} dispositivos`, 'success');
                    resolve(inventario);
                    
                } catch (error) {
                    mostrarToast('Error al leer el archivo', 'error');
                    reject(error);
                }
            };
            reader.onerror = () => {
                mostrarToast('Error al leer el archivo', 'error');
                reject(new Error('Error al leer'));
            };
            reader.readAsText(file);
            
        } catch (error) {
            console.error('Error al importar:', error);
            mostrarToast('Error al importar los datos', 'error');
            reject(error);
        }
    });
}

function importarExcel(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Verificar que XLSX está disponible
                    if (typeof XLSX === 'undefined') {
                        mostrarToast('Error: Librería XLSX no cargada', 'error');
                        reject(new Error('Librería XLSX no disponible'));
                        return;
                    }
                    
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(primeraHoja);
                    
                    if (!jsonData || jsonData.length === 0) {
                        mostrarToast('El archivo Excel está vacío', 'error');
                        reject(new Error('Archivo vacío'));
                        return;
                    }
                    
                    const columnas = Object.keys(jsonData[0]);
                    
                    const mapeo = {
                        id: columnas.find(col => /id/i.test(col)),
                        tipo: columnas.find(col => /tipo|tipo dispositivo|categoria|categoría/i.test(col)),
                        marca: columnas.find(col => /marca|fabricante/i.test(col)),
                        modelo: columnas.find(col => /modelo|referencia/i.test(col)),
                        serial: columnas.find(col => /serial|serie|número serie|numero serie/i.test(col)),
                        ubicacion: columnas.find(col => /ubicacion|ubicación|localizacion|localización|area|área/i.test(col)),
                        estado: columnas.find(col => /estado|condicion|condición|status/i.test(col))
                    };
                    
                    if (!mapeo.tipo || !mapeo.marca || !mapeo.modelo || !mapeo.serial) {
                        mostrarToast('El Excel debe tener: Tipo, Marca, Modelo y Serial', 'error');
                        reject(new Error('Columnas insuficientes'));
                        return;
                    }
                    
                    const dispositivos = jsonData.map((fila, index) => {
                        const tipo = fila[mapeo.tipo]?.toString().trim() || '';
                        const marca = fila[mapeo.marca]?.toString().trim() || '';
                        const modelo = fila[mapeo.modelo]?.toString().trim() || '';
                        const serial = fila[mapeo.serial]?.toString().trim() || '';
                        const ubicacion = mapeo.ubicacion ? fila[mapeo.ubicacion]?.toString().trim() || '' : '';
                        const estado = mapeo.estado ? fila[mapeo.estado]?.toString().trim() || 'Disponible' : 'Disponible';
                        
                        let id;
                        if (mapeo.id && fila[mapeo.id]) {
                            id = parseInt(fila[mapeo.id]);
                            if (isNaN(id)) {
                                id = nextId + index;
                            }
                        } else {
                            id = nextId + index;
                        }
                        
                        const estadosValidos = ['Disponible', 'Asignado', 'Reparación', 'Baja'];
                        const estadoNormalizado = estadosValidos.find(e => 
                            e.toLowerCase() === estado.toLowerCase()
                        ) || 'Disponible';
                        
                        return {
                            id: id,
                            tipo: tipo || 'Sin Tipo',
                            marca: marca || 'Sin Marca',
                            modelo: modelo || 'Sin Modelo',
                            serial: serial || `SIN-SERIAL-${index}`,
                            ubicacion: ubicacion,
                            estado: estadoNormalizado,
                            fecha_creacion: new Date().toISOString()
                        };
                    });
                    
                    const dispositivosValidos = dispositivos.filter(d => 
                        d.tipo && d.marca && d.modelo && d.serial
                    );
                    
                    if (dispositivosValidos.length === 0) {
                        mostrarToast('No se encontraron datos válidos en el Excel', 'error');
                        reject(new Error('Sin datos válidos'));
                        return;
                    }
                    
                    const seriales = new Set();
                    const duplicados = [];
                    const unicos = [];
                    
                    dispositivosValidos.forEach(d => {
                        if (seriales.has(d.serial)) {
                            duplicados.push(d.serial);
                        } else {
                            seriales.add(d.serial);
                            unicos.push(d);
                        }
                    });
                    
                    if (duplicados.length > 0) {
                        mostrarToast(`⚠️ ${duplicados.length} seriales duplicados. Se importarán solo los únicos.`, 'warning');
                    }
                    
                    resolve({
                        dispositivos: unicos,
                        total: dispositivosValidos.length,
                        importados: unicos.length,
                        duplicados: duplicados.length
                    });
                    
                } catch (error) {
                    console.error('Error al leer Excel:', error);
                    mostrarToast('Error al leer el archivo Excel', 'error');
                    reject(error);
                }
            };
            reader.onerror = () => {
                mostrarToast('Error al leer el archivo', 'error');
                reject(new Error('Error al leer'));
            };
            reader.readAsArrayBuffer(file);
            
        } catch (error) {
            console.error('Error al importar Excel:', error);
            mostrarToast('Error al importar Excel', 'error');
            reject(error);
        }
    });
}

// ============ INICIALIZACIÓN ============

cargarInventario();

console.log('📦 Inventario cargado:', inventario.length, 'items');
console.log('🔑 Próximo ID:', nextId);
console.log('💾 Datos guardados en localStorage');