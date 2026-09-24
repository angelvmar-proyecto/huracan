let appState = {
    currentTab: 'trayectoria',
    map: null,
    hurricaneMarker: null,
    forecastLine: null
};

// =====================================================
//  INICIALIZACIÓN DEL MAPA Y TRAYECTORIA DEL HURACÁN
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

function initMap() {
    // Coordenadas centradas en México / Pacífico mexicano
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([16.5, -103.0], 5);

    // Capa de mapa oscuro estilo GIS profesional (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap & CARTO'
    }).addTo(appState.map);

    // Agregar controles de zoom personalizados en la esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    // Dibujar el sistema activo en el Pacífico (Simulación en tiempo real basada en reportes oficiales)
    renderActiveHurricane();
}

function renderActiveHurricane() {
    // Coordenadas aproximadas del sistema actual en el Pacífico
    const stormLat = 16.8;
    const stormLon = -104.2;

    // Círculo de radio de afectación / categoría
    const stormRadius = L.circle([stormLat, stormLon], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        radius: 180000 // 180 km de radio de bandas nubosas
    }).addTo(appState.map);

    // Marcador principal del huracán
    const stormIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #ef4444; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 15px rgba(239,68,68,0.8); border: 2px solid #fff;">🌀</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    appState.hurricaneMarker = L.marker([stormLat, stormLon], { icon: stormIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Ciclón Activo en el Pacífico</b><br>Vientos máximos sostenidos elevados.<br>Estado: Vigilancia / Alerta Máxima.")
        .openPopup();

    // Línea de trayectoria pronosticada (hacia el noroeste / costa)
    const forecastCoords = [
        [stormLat, stormLon],
        [18.2, -106.0],
        [19.8, -108.5]
    ];
    
    appState.forecastLine = L.polyline(forecastCoords, {
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 6'
    }).addTo(appState.map);

    // Actualizar tarjeta flotante con datos del ciclón
    const infoCard = document.querySelector('.info-card-floating');
    if(infoCard) {
        infoCard.innerHTML = `
            <div class="titulo-panel" style="color: #ef4444;">🌀 Ciclón Tropical Activo (Pacífico)</div>
            <div class="sub-texto" style="color: #fff; margin-top: 4px;">Lat/Lon: ${stormLat}°, ${stormLon}° | Desplazamiento Nor-Noroeste</div>
        `;
    }
}

// =====================================================
//  CAMBIO DE PESTAÑAS FLUIDO (SIN RECARGAR EL DOM)
// =====================================================
function switchTab(tabId, evt) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.weather-panel').forEach(panel => panel.classList.remove('active'));

    evt.currentTarget.classList.add('active');
    document.getElementById(`panel-${tabId}`).classList.add('active');
    appState.currentTab = tabId;

    // Si pasamos al mapa, recalculamos el tamaño para evitar bugs visuales en WebView
    if(tabId === 'trayectoria' && appState.map) {
        setTimeout(() => appState.map.invalidateSize(), 150);
    }
}
