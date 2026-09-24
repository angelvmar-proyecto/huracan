let appState = {
    currentTab: 'trayectoria',
    map: null,
    hurricaneMarker: null,
    forecastLine: null
};

document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

function initMap() {
    // Centrado estratégico en México para mostrar tanto el Pacífico como el Golfo/Caribe
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([20.0, -100.0], 5);

    // Mapa base limpio con ciudades, nombres y divisiones políticas claras (CartoDB Positron o similar limpio)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors & CARTO'
    }).addTo(appState.map);

    // Controles de zoom táctiles arriba a la derecha
    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    // Renderizar huracán Polo en el Pacífico (Cat 5) y posición de vigilancia
    renderActiveHurricanes();
}

function renderActiveHurricanes() {
    // Coordenadas reales recientes de Huracán Polo (Pacífico mexicano)
    const poloLat = 16.8;
    const poloLon = -104.2;

    // Círculo de afectación de Polo
    L.circle([poloLat, poloLon], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        radius: 200000
    }).addTo(appState.map);

    // Icono destacado de Huracán Mayor (Cat 5)
    const poloIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #ef4444; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 15px rgba(239,68,68,0.9); border: 2px solid #fff;">🌀</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
    });

    appState.hurricaneMarker = L.marker([poloLat, poloLon], { icon: poloIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Huracán Polo (Categoría 5)</b><br>Vientos: 260 km/h<br>Ubicación: Suroeste de México (Pacífico)")
        .openPopup();

    // Línea de trayectoria pronosticada hacia el Nor-Noroeste
    const forecastCoords = [
        [poloLat, poloLon],
        [18.5, -106.5],
        [20.2, -109.0]
    ];
    
    appState.forecastLine = L.polyline(forecastCoords, {
        color: '#f59e0b',
        weight: 4,
        dashArray: '8, 8'
    }).addTo(appState.map);
}

function switchTab(tabId, evt) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.weather-panel').forEach(panel => panel.classList.remove('active'));

    evt.currentTarget.classList.add('active');
    document.getElementById(`panel-${tabId}`).classList.add('active');
    appState.currentTab = tabId;

    if(tabId === 'trayectoria' && appState.map) {
        setTimeout(() => appState.map.invalidateSize(), 150);
    }
}
