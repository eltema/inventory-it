// ============ PUNTO DE ENTRADA ============

function init() {
    try {
        // Mostrar loading
        DOM.tablaBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
                    <p>Cargando inventario...</p>
                </td>
            </tr>
        `;
        
        aplicarFiltros();
        
        console.log('✅ Inventario cargado:', inventario.length, 'items');
        console.log('💾 Datos guardados en localStorage');
        console.log('📊 Estadísticas:', obtenerEstadisticas());
        
    } catch (error) {
        console.error('Error al iniciar:', error);
        mostrarToast('Error al cargar los datos', 'error');
    }
}

document.addEventListener('DOMContentLoaded', init);