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
    initLocalWeather();
});

function initMap() {
    // Centrado estratégico para abarcar tanto el Pacífico como el Caribe y México
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([18.5, -92.0], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.map);

    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    renderActiveStorms();
}

function renderActiveStorms() {
    // Limpiar capas anteriores si existieran
    appState.markers.forEach(m => appState.map.removeLayer(m));
    appState.lines.forEach(l => appState.map.removeLayer(l));
    appState.markers = [];
    appState.lines = [];

    // =========================================================
    // 1. SISTEMAS ACTIVOS EN EL OCÉANO PACÍFICO
    // =========================================================
    
    // Huracán Polo (Pacífico - Cat 4/5)
    const poloLat = 16.8;
    const poloLon = -104.2;
    const poloTrajectory = [
        [poloLat, poloLon],
        [17.8, -107.0],
        [19.5, -110.5],
        [21.8, -114.5]
    ];
    const poloConeCoords = [
        [16.2, -103.8],
        [17.4, -103.5],
        [23.0, -113.0],
        [20.5, -116.5],
        [15.8, -105.0]
    ];

    dibujarSistemaCiclones("Huracán Polo (Cat. 4/5)", poloLat, poloLon, '#dc2626', '4', poloTrajectory, poloConeCoords, [
        { lat: 17.8, lon: -107.0, label: 'M' },
        { lat: 19.5, lon: -110.5, label: 'H' },
        { lat: 21.8, lon: -114.5, label: 'T' }
    ]);

    // Huracán Odalys (Pacífico Abierto - Cat 1)
    const odalysLat = 22.5;
    const odalysLon = -122.0;
    const odalysTrajectory = [
        [odalysLat, odalysLon],
        [24.0, -125.0],
        [26.2, -129.5]
    ];
    const odalysConeCoords = [
        [21.8, -121.5],
        [23.2, -121.0],
        [27.5, -128.5],
        [25.0, -131.0]
    ];

    dibujarSistemaCiclones("Huracán Odalys (Cat. 1)", odalysLat, odalysLon, '#3b82f6', '1', odalysTrajectory, odalysConeCoords, [
        { lat: 24.0, lon: -125.0, label: 'H' },
        { lat: 26.2, lon: -129.5, label: 'T' }
    ]);


    // =========================================================
    // 2. SISTEMAS ACTIVOS EN EL CARIBE Y ATLÁNTICO
    // =========================================================

    // Tormenta Tropical / Onda en el Caribe
    const caribeLat = 15.5;
    const caribeLon = -78.0;
    const caribeTrajectory = [
        [caribeLat, caribeLon],
        [17.2, -82.5],
        [19.5, -86.8]
    ];
    const caribeConeCoords = [
        [14.8, -77.5],
        [16.2, -77.2],
        [20.5, -85.5],
        [18.5, -88.2]
    ];

    dibujarSistemaCiclones("Tormenta Tropical en el Caribe", caribeLat, caribeLon, '#10b981', 'TT', caribeTrajectory, caribeConeCoords, [
        { lat: 17.2, lon: -82.5, label: 'T' },
        { lat: 19.5, lon: -86.8, label: 'H' }
    ]);

    // Polígono de probabilidad institucional en el Caribe (similar a las zonas verdes del SMN)
    const zonaCaribeCoords = [
        [12.0, -80.0],
        [16.0, -70.0],
        [19.0, -75.0],
        [14.5, -84.0]
    ];
    const zonaCaribePoly = L.polygon(zonaCaribeCoords, {
        color: '#eab308',
        weight: 1.5,
        fillColor: '#22c55e',
        fillOpacity: 0.22,
        dashArray: '5, 5'
    }).addTo(appState.map);
    appState.lines.push(zonaCaribePoly);
}

function dibujarSistemaCiclones(nombre, lat, lon, colorHex, badgeTexto, trayectoriaCoords, conoCoords, secuenciales) {
    // 1. Cono de incertidumbre simétrico
    const cono = L.polygon(conoCoords, {
        color: colorHex,
        weight: 1.5,
        fillColor: colorHex,
        fillOpacity: 0.18,
        dashArray: '4, 4'
    }).addTo(appState.map);
    appState.lines.push(cono);

    // 2. Línea central de trayectoria
    const lineaTrayectoria = L.polyline(trayectoriaCoords, {
        color: colorHex,
        weight: 3.5,
        opacity: 0.9
    }).addTo(appState.map);
    appState.lines.push(lineaTrayectoria);

    // 3. Puntos secuenciales (T, H, M)
    secuenciales.forEach(pt => {
        const seqIcon = L.divIcon({
            className: 'sequential-marker',
            html: `<div style="background: white; color: ${colorHex}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid ${colorHex}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${pt.label}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        const markerSeq = L.marker([pt.lat, pt.lon], { icon: seqIcon }).addTo(appState.map);
        appState.markers.push(markerSeq);
    });

    // 4. Marcador principal del ciclón en el ojo actual
    const iconoPrincipal = L.divIcon({
        className: 'custom-storm-marker',
        html: `<div style="background: ${colorHex}; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; box-shadow: 0 0 12px ${colorHex}; border: 2px solid #fff;">${badgeTexto}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    const marker = L.marker([lat, lon], { icon: iconoPrincipal })
        .addTo(appState.map)
        .bindPopup(`<b>🌀 ${nombre}</b><br>Monitoreo oficial SMN / CONAGUA`);
    
    appState.markers.push(marker);
}

// =====================================================
//  CAPAS VISUALES Y CLIMA LOCAL
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
    const groupLayers = [];
    const puntosInteres = [
        { lat: 17.8, lon: -107.0 },
        { lat: 18.2, lon: -84.0 },
        { lat: 24.0, lon: -125.0 }
    ];

    if (tipo === 'infrarrojo') {
        tituloLeyenda = "🛰️ Nubes y Masas Nubosas";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>☁️ Iconos:</b> Convección y nubosidad en Pacífico y Caribe.</div>';
        puntosInteres.forEach(pt => {
            const icono = L.divIcon({
                className: 'weather-emoji',
                html: '<div style="font-size: 26px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">☁️⛈️</div>',
                iconSize: [30, 30], iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: icono }));
        });
    } else if (tipo === 'vientos') {
        tituloLeyenda = "💨 Vectores de Viento";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>💨 Símbolos:</b> Dirección de flujos en ambas cuencas.</div>';
        puntosInteres.forEach(pt => {
            const icono = L.divIcon({
                className: 'weather-emoji',
                html: '<div style="font-size: 26px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">💨</div>',
                iconSize: [30, 30], iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: icono }));
        });
    } else if (tipo === 'precipitacion') {
        tituloLeyenda = "🌧️ Zonas de Precipitación";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>🌧️ Símbolos:</b> Lluvias intensas asociadas a sistemas.</div>';
        puntosInteres.forEach(pt => {
            const icono = L.divIcon({
                className: 'weather-emoji',
                html: '<div style="font-size: 26px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">🌧️⚡</div>',
                iconSize: [30, 30], iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: icono }));
        });
    }

    appState.activeRadarLayer = L.layerGroup(groupLayers).addTo(appState.map);

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

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.weather-panel').forEach(p => p.classList.remove('active'));
    
    document.querySelector('.weather-tabs button:first-child').classList.add('active');
    document.getElementById('panel-trayectoria').classList.add('active');
    appState.currentTab = 'trayectoria';

    setTimeout(() => appState.map.invalidateSize(), 150);
}

function initLocalWeather() {
    const localContainer = document.getElementById('panel-pronostico');
    if (localContainer) {
        localContainer.innerHTML = `
            <div class="panel-content-inner">
                <h2 class="titulo-panel" style="font-size: 18px; margin-bottom: 6px;">📍 Clima en tu Ubicación Local</h2>
                <p class="sub-texto" style="margin-bottom: 16px;">Monitoreo oficial simultáneo para Pacífico y Caribe.</p>

                <div class="card-option" style="background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.4); margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #ef4444;">
                        <span>🌊 Cuenca del Pacífico (Polo / Odalys)</span>
                        <span>Alerta Activa</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 6px;">Vigilancia en litoral del Pacífico por bandas nubosas y oleaje elevado.</div>
                </div>

                <div class="card-option" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #10b981;">
                        <span>🌴 Cuenca del Caribe y Península</span>
                        <span>Vigilancia Tropical</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 6px;">Seguimiento a perturbación en el Caribe central con potencial ciclónico gradual.</div>
                </div>
            </div>
        `;
    }
}

function abrirBoletinOficial(tipo) {
    let urlOficial = "https://smn.conagua.gob.mx/es/ciclones-tropicales/cuenca-del-pacifico";
    if (tipo === 'caribe') {
        urlOficial = "https://smn.conagua.gob.mx/es/ciclones-tropicales/cuenca-del-atlantico";
    } else if (tipo === 'puertos') {
        urlOficial = "https://www.gob.mx/semar";
    }
    window.open(urlOficial, '_blank');
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
