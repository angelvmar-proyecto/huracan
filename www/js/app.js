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
    // Centrado estratégico en México
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([20.0, -100.0], 5);

    // Mapa base limpio
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.map);

    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    renderActiveStorms();
}

function renderActiveStorms() {
    // ---------------------------------------------------------
    // 1. HURACÁN POLO (Pacífico Sur - Cat 4/5)
    // ---------------------------------------------------------
    const poloLat = 16.8;
    const poloLon = -104.2;

    // Cono de Incertidumbre Oficial (Polígono amplio y simétrico que engloba la trayectoria)
    const poloConeCoords = [
        [poloLat, poloLon],
        [17.5, -105.8],
        [20.5, -111.5],
        [23.0, -116.0],
        [21.0, -117.5],
        [18.5, -112.0],
        [16.2, -107.0]
    ];

    const poloCone = L.polygon(poloConeCoords, {
        color: '#dc2626',
        weight: 1.5,
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        dashArray: '5, 5'
    }).addTo(appState.map);
    appState.lines.push(poloCone);

    // Trayectoria central exacta alineada dentro del cono
    const poloTrajectoryCoords = [
        [poloLat, poloLon],
        [17.6, -106.2],
        [19.2, -109.0],
        [21.5, -113.8]
    ];

    const poloForecast = L.polyline(poloTrajectoryCoords, {
        color: '#dc2626',
        weight: 4,
        opacity: 0.9
    }).addTo(appState.map);
    appState.lines.push(poloForecast);

    // Puntos secuenciales institucionales sobre la trayectoria (M, H, T...)
    const puntosSecuenciales = [
        { lat: 17.6, lon: -106.2, label: 'M' },
        { lat: 19.2, lon: -109.0, label: 'H' },
        { lat: 21.5, lon: -113.8, label: 'T' }
    ];

    puntosSecuenciales.forEach(pt => {
        const seqIcon = L.divIcon({
            className: 'sequential-marker',
            html: `<div style="background: white; color: #dc2626; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 2px solid #dc2626; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${pt.label}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });
        const markerSeq = L.marker([pt.lat, pt.lon], { icon: seqIcon }).addTo(appState.map);
        appState.markers.push(markerSeq);
    });

    // Zona de vigilancia / probabilidad baja adicional (como los polígonos verdes del SMN)
    const zonaVigilanciaCoords = [
        [12.5, -115.0],
        [14.0, -100.0],
        [17.0, -98.0],
        [13.5, -112.0]
    ];
    const zonaVigilancia = L.polygon(zonaVigilanciaCoords, {
        color: '#eab308',
        weight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.25,
        dashArray: '6, 6'
    }).addTo(appState.map);
    appState.lines.push(zonaVigilancia);

    // Marcador principal de Huracán Polo (Cat 4/5)
    const poloIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: '<div style="background: #dc2626; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; box-shadow: 0 0 12px rgba(220,38,38,0.9); border: 2px solid #fff;">4</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
    });

    const poloMarker = L.marker([poloLat, poloLon], { icon: poloIcon })
        .addTo(appState.map)
        .bindPopup("<b>🌀 Huracán Polo (Cat. 4/5)</b><br>Vientos: ~260 km/h<br>SMN/CONAGUA: Impacto potencial en litoral");
    appState.markers.push(poloMarker);
    poloMarker.openPopup();


    // ---------------------------------------------------------
    // 2. ZONA DE ALERTA AMARILLA / PREVENTIVA EN TIERRA
    // ---------------------------------------------------------
    const alertaTierraCoords = [
        [19.0, -104.5],
        [22.0, -108.0],
        [20.5, -105.0],
        [18.5, -103.0]
    ];
    const alertaTierra = L.polygon(alertaTierraCoords, {
        color: '#eab308',
        weight: 2,
        fillColor: '#facc15',
        fillOpacity: 0.3
    }).addTo(appState.map);
    appState.lines.push(alertaTierra);
}

// =====================================================
//  CAPAS VISUALES CON ICONOS INSTITUCIONALES CLAROS
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
        { lat: 17.5, lon: -103.5 },
        { lat: 18.5, lon: -105.5 },
        { lat: 20.0, lon: -108.0 }
    ];

    if (tipo === 'infrarrojo') {
        tituloLeyenda = "🛰️ Nubes y Masas Nubosas";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>☁️ Iconos:</b> Concentración masiva de humedad y convección profunda.</div>';
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
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>💨 Símbolos:</b> Dirección e intensidad de rachas ciclónicas.</div>';
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
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>🌧️ Símbolos:</b> Aguaceros fuertes y tormentas eléctricas.</div>';
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
                <p class="sub-texto" style="margin-bottom: 16px;">Monitoreo oficial directo para zonas costeras y peninsulares.</p>

                <div class="card-option" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #ef4444;">
                        <span>⚠️ Huracán Polo (Pacífico)</span>
                        <span>Efecto Indirecto / Vigente</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 6px;">Vaguadas y bandas nubosas reforzando lluvias en el sur y occidente del país.</div>
                </div>

                <div class="card-option" style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #f59e0b;">
                        <span>🌴 Península de Yucatán y Caribe</span>
                        <span>🌤️ 32°C / Tormentas Vespertinas</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 6px;">Ambiente caluroso con presencia de chubascos dispersos por ondas tropicales. Sin ciclón directo amenazando la zona.</div>
                </div>
            </div>
        `;
    }
}

function abrirBoletinOficial(tipo) {
    let urlOficial = "https://smn.conagua.gob.mx/es/ciclones-tropicales/cuenca-del-pacifico";
    if (tipo === 'puertos') {
        urlOficial = "https://www.gob.mx/semar";
    } else if (tipo === 'aviso_general') {
        urlOficial = "https://smn.conagua.gob.mx/es/";
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
