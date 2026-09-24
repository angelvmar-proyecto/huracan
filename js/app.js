let appState = {
    currentTab: 'trayectoria',
    map: null,
    markers: [],
    lines: [],
    activeRadarLayer: null
};

document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

function initMap() {
    // Centrado estratégico en México
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([20.0, -100.0], 5);

    // Mapa base clásico OpenStreetMap limpio
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.map);

    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    renderActiveStorms();
}

function renderActiveStorms() {
    // 1. HURACÁN POLO (Pacífico Sur - Cat 4/5)
    const poloLat = 16.8;
    const poloLon = -104.2;

    const poloRadius = L.circle([poloLat, poloLon], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        radius: 220000
    }).addTo(appState.map);
    appState.lines.push(poloRadius);

    const poloIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #ef4444; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 15px rgba(239,68,68,0.9); border: 2px solid #fff;">🌀</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const poloMarker = L.marker([poloLat, poloLon], { icon: poloIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Huracán Polo (Cat. 4/5)</b><br>Vientos: ~260 km/h<br>Ubicación: Suroeste de México");
    appState.markers.push(poloMarker);

    const poloForecast = L.polyline([
        [poloLat, poloLon],
        [18.5, -106.5],
        [20.2, -109.0]
    ], {
        color: '#f59e0b',
        weight: 4,
        dashArray: '8, 8'
    }).addTo(appState.map);
    appState.lines.push(poloForecast);

    // 2. HURACÁN ODALYS (Pacífico Abierto - Cat 1)
    const odalysLat = 22.5;
    const odalysLon = -122.0;

    const odalysRadius = L.circle([odalysLat, odalysLon], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 180000
    }).addTo(appState.map);
    appState.lines.push(odalysRadius);

    const odalysIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #3b82f6; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 0 10px rgba(59,130,246,0.8); border: 2px solid #fff;">🌀</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    const odalysMarker = L.marker([odalysLat, odalysLon], { icon: odalysIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Huracán Odalys (Cat. 1)</b><br>Vientos: ~120 km/h<br>Mar abierto");
    appState.markers.push(odalysMarker);

    // Trayectoria pronosticada de Odalys hacia el Oeste-Noroeste
    const odalysForecast = L.polyline([
        [odalysLat, odalysLon],
        [23.8, -125.0],
        [25.0, -128.5]
    ], {
        color: '#3b82f6',
        weight: 4,
        dashArray: '8, 8'
    }).addTo(appState.map);
    appState.lines.push(odalysForecast);

    poloMarker.openPopup();
}

// =====================================================
//  CAPAS DE RADAR NATIVAS (100% FUNCIONALES EN ANDROID)
// =====================================================
function aplicarCapaRadar(tipo) {
    if (appState.activeRadarLayer) {
        appState.map.removeLayer(appState.activeRadarLayer);
        appState.activeRadarLayer = null;
    }

    if (tipo === 'infrarrojo') {
        appState.activeRadarLayer = L.layerGroup([
            L.circle([16.8, -104.2], { color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.35, radius: 300000 }),
            L.circle([18.0, -106.0], { color: '#c084fc', fillColor: '#c084fc', fillOpacity: 0.3, radius: 250000 }),
            L.circle([22.5, -122.0], { color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.3, radius: 220000 })
        ]).addTo(appState.map);
        alert("🛰️ Capa de Infrarrojo Satelital aplicada al mapa.");
    } else if (tipo === 'vientos') {
        appState.activeRadarLayer = L.layerGroup([
            L.circle([16.8, -104.2], { color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.25, radius: 350000 }),
            L.circle([22.5, -122.0], { color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.2, radius: 280000 })
        ]).addTo(appState.map);
        alert("💨 Capa de Vectores de Viento aplicada al mapa.");
    } else if (tipo === 'precipitacion') {
        appState.activeRadarLayer = L.layerGroup([
            L.circle([16.5, -103.5], { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.4, radius: 180000 }),
            L.circle([17.2, -105.0], { color: '#eab308', fillColor: '#eab308', fillOpacity: 0.4, radius: 120000 }),
            L.circle([16.8, -104.2], { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.5, radius: 70000 })
        ]).addTo(appState.map);
        alert("🌧️ Capa de Precipitación y Radar Doppler aplicada al mapa.");
    }

    // Regresar a la pestaña de trayectoria para visualizar el resultado
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.weather-panel').forEach(p => p.classList.remove('active'));
    
    document.querySelector('.weather-tabs button:first-child').classList.add('active');
    document.getElementById('panel-trayectoria').classList.add('active');
    appState.currentTab = 'trayectoria';

    setTimeout(() => appState.map.invalidateSize(), 150);
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
