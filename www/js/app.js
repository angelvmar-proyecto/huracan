let appState = {
    currentTab: 'trayectoria',
    map: null,
    markers: [],
    lines: [],
    activeRadarLayer: null,
    legendControl: null
};

document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

function initMap() {
    // Centrado estratégico en México
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([20.0, -100.0], 5);

    // Corrección de la URL del mapa base OpenStreetMap (¡Restaurado con éxito!)
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
        fillOpacity: 0.15,
        radius: 220000
    }).addTo(appState.map);
    appState.lines.push(poloRadius);

    // Cono de Incertidumbre Simétrico
    const poloConeCoords = [
        [poloLat, poloLon],
        [17.8, -105.8],
        [21.2, -112.0],
        [19.8, -113.5],
        [18.2, -111.0],
        [16.5, -106.8]
    ];

    const poloCone = L.polygon(poloConeCoords, {
        color: '#f59e0b',
        weight: 1,
        fillColor: '#f59e0b',
        fillOpacity: 0.22,
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
        [20.2, -109.0],
        [22.0, -112.5]
    ], {
        color: '#ffffff',
        weight: 3,
        dashArray: '6, 6'
    }).addTo(appState.map);
    appState.lines.push(poloForecast);

    // 2. HURACÁN ODALYS (Pacífico Abierto - Cat 1)
    const odalysLat = 22.5;
    const odalysLon = -122.0;

    const odalysConeCoords = [
        [odalysLat, odalysLon],
        [23.5, -123.5],
        [27.0, -131.0],
        [25.5, -132.5],
        [24.0, -129.0],
        [21.5, -124.0]
    ];

    const odalysCone = L.polygon(odalysConeCoords, {
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
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
        [25.0, -128.5],
        [26.2, -131.5]
    ], {
        color: '#ffffff',
        weight: 3,
        dashArray: '6, 6'
    }).addTo(appState.map);
    appState.lines.push(odalysForecast);

    poloMarker.openPopup();
}

// =====================================================
//  CAPAS CON LEYENDA AMIGABLE (POSICIÓN SUPERIOR)
// =====================================================
function aplicarCapaRadar(tipo) {
    if (appState.activeRadarLayer) {
        appState.map.removeLayer(appState.activeRadarLayer);
        appState.activeRadarLayer = null;
    }
    if (appState.legendControl) {
        appState.map.removeControl(appState.legendControl);
        appState.legendControl = null;
    }

    let tituloLeyenda = "";
    let htmlLeyenda = "";

    if (tipo === 'infrarrojo') {
        appState.activeRadarLayer = L.layerGroup([
            L.rectangle([[5.0, -135.0], [32.0, -85.0]], { color: '#9333ea', weight: 0, fillColor: '#a855f7', fillOpacity: 0.25 }),
            L.rectangle([[12.0, -115.0], [25.0, -95.0]], { color: '#7e22ce', weight: 0, fillColor: '#c084fc', fillOpacity: 0.35 })
        ]).addTo(appState.map);

        tituloLeyenda = "🛰️ Nubes y Tormentas";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>Morado/Claro:</b> Carga nubosa densa<br><b>Blanco central:</b> Zona de tormenta severa</div>';
    } else if (tipo === 'vientos') {
        appState.activeRadarLayer = L.layerGroup([
            L.rectangle([[8.0, -130.0], [30.0, -90.0]], { color: '#0284c7', weight: 0, fillColor: '#38bdf8', fillOpacity: 0.2 })
        ]).addTo(appState.map);

        tituloLeyenda = "💨 Intensidad del Viento";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>Celeste:</b> Vientos moderados<br><b>Azul fuerte:</b> Rachas de huracán</div>';
    } else if (tipo === 'precipitacion') {
        appState.activeRadarLayer = L.layerGroup([
            L.rectangle([[14.0, -110.0], [21.0, -100.0]], { color: '#16a34a', weight: 0, fillColor: '#22c55e', fillOpacity: 0.3 }),
            L.rectangle([[15.5, -106.0], [18.0, -102.0]], { color: '#dc2626', weight: 0, fillColor: '#ef4444', fillOpacity: 0.45 })
        ]).addTo(appState.map);

        tituloLeyenda = "🌧️ Lluvias y Aguaceros";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>Verde:</b> Lluvia ligera o moderada<br><b>Rojo:</b> Lluvias torrenciales (Peligro)</div>';
    }

    // Colocar la leyenda en la esquina superior izquierda para no tapar los controles inferiores
    const LegendControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function (map) {
            const div = L.DomUtil.create('div', 'info-legend');
            div.style.background = 'rgba(15, 23, 42, 0.95)';
            div.style.color = '#fff';
            div.style.padding = '10px 14px';
            div.style.borderRadius = '8px';
            div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.4)';
            div.style.border = '1px solid rgba(255,255,255,0.15)';
            div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><b style="color: #f59e0b; font-size:12px;">${tituloLeyenda}</b><button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#aaa; font-size:14px; cursor:pointer; margin-left:8px;">&times;</button></div><hr style="border:0; border-top:1px solid rgba(255,255,255,0.2); margin:4px 0;">${htmlLeyenda}`;
            return div;
        }
    });

    appState.legendControl = new LegendControl();
    appState.map.addControl(appState.legendControl);

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
