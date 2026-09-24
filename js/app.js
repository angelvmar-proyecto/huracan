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

    // Radio de vientos de huracán
    const poloRadius = L.circle([poloLat, poloLon], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        radius: 220000
    }).addTo(appState.map);
    appState.lines.push(poloRadius);

    // Cono de Incertidumbre / Probabilidad de Trayectoria (Polígono de desviación)
    const poloCone = L.polygon([
        [poloLat, poloLon],
        [17.5, -105.5],
        [21.5, -111.0],
        [19.0, -108.5]
    ], {
        color: '#f59e0b',
        weight: 1,
        fillColor: '#f59e0b',
        fillOpacity: 0.25,
        dashArray: '4, 4'
    }).addTo(appState.map);
    appState.lines.push(poloCone);

    const poloIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #ef4444; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 15px rgba(239,68,68,0.9); border: 2px solid #fff;">🌀</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const poloMarker = L.marker([poloLat, poloLon], { icon: poloIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Huracán Polo (Cat. 4/5)</b><br>Vientos: ~260 km/h<br>SIAT-CT: Alerta Roja (Peligro Máximo)");
    appState.markers.push(poloMarker);

    const poloForecast = L.polyline([
        [poloLat, poloLon],
        [18.5, -106.5],
        [20.2, -109.0]
    ], {
        color: '#ffffff',
        weight: 3,
        dashArray: '6, 6'
    }).addTo(appState.map);
    appState.lines.push(poloForecast);

    // 2. HURACÁN ODALYS (Pacífico Abierto - Cat 1)
    const odalysLat = 22.5;
    const odalysLon = -122.0;

    const odalysCone = L.polygon([
        [odalysLat, odalysLon],
        [23.0, -124.0],
        [26.5, -130.0],
        [24.0, -127.0]
    ], {
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        dashArray: '4, 4'
    }).addTo(appState.map);
    appState.lines.push(odalysCone);

    const odalysIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #3b82f6; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 0 10px rgba(59,130,246,0.8); border: 2px solid #fff;">🌀</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    const odalysMarker = L.marker([odalysLat, odalysLon], { icon: odalysIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Huracán Odalys (Cat. 1)</b><br>Vientos: ~120 km/h<br>Mar abierto - Sin amenaza directa");
    appState.markers.push(odalysMarker);

    const odalysForecast = L.polyline([
        [odalysLat, odalysLon],
        [23.8, -125.0],
        [25.0, -128.5]
    ], {
        color: '#ffffff',
        weight: 3,
        dashArray: '6, 6'
    }).addTo(appState.map);
    appState.lines.push(odalysForecast);

    poloMarker.openPopup();
}

// =====================================================
//  CAPAS DE RADAR DE COBERTURA TOTAL EN EL MAPA
// =====================================================
function aplicarCapaRadar(tipo) {
    if (appState.activeRadarLayer) {
        appState.map.removeLayer(appState.activeRadarLayer);
        appState.activeRadarLayer = null;
    }

    // Usar rectángulos de cobertura regional amplia que cubren todo el mapa/océanos
    if (tipo === 'infrarrojo') {
        appState.activeRadarLayer = L.layerGroup([
            L.rectangle([[5.0, -135.0], [32.0, -85.0]], { color: '#9333ea', weight: 0, fillColor: '#a855f7', fillOpacity: 0.25 }),
            L.rectangle([[12.0, -115.0], [25.0, -95.0]], { color: '#7e22ce', weight: 0, fillColor: '#c084fc', fillOpacity: 0.35 })
        ]).addTo(appState.map);
        alert("🛰️ Capa de Infrarrojo Satelital aplicada a todo el territorio.");
    } else if (tipo === 'vientos') {
        appState.activeRadarLayer = L.layerGroup([
            L.rectangle([[8.0, -130.0], [30.0, -90.0]], { color: '#0284c7', weight: 0, fillColor: '#38bdf8', fillOpacity: 0.2 })
        ]).addTo(appState.map);
        alert("💨 Capa de Vectores de Viento aplicada en ambas cuencas.");
    } else if (tipo === 'precipitacion') {
        appState.activeRadarLayer = L.layerGroup([
            L.rectangle([[14.0, -110.0], [21.0, -100.0]], { color: '#16a34a', weight: 0, fillColor: '#22c55e', fillOpacity: 0.3 }),
            L.rectangle([[15.5, -106.0], [18.0, -102.0]], { color: '#dc2626', weight: 0, fillColor: '#ef4444', fillOpacity: 0.45 })
        ]).addTo(appState.map);
        alert("🌧️ Capa de Precipitación y Radares Doppler activa.");
    }

    // Regresar a la pestaña de trayectoria
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
