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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.map);

    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    renderActiveStorms();
}

function renderActiveStorms() {
    const poloLat = 16.8;
    const poloLon = -104.2;

    const poloRadius = L.circle([poloLat, poloLon], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        radius: 220000
    }).addTo(appState.map);
    appState.lines.push(poloRadius);

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
        .bindPopup("<b>🌀 Huracán Polo (Cat. 4/5)</b><br>Vientos: ~260 km/h<br>SMN/CONAGUA: Alerta de impacto en litoral del Pacífico");
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
        .bindPopup("<b>🌀 Huracán Odalys (Cat. 1)</b><br>Vientos: ~120 km/h<br>Mar abierto - Sin amenaza directa a costas");
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
//  CAPAS VISUALES CON ICONOS ILUSTRATIVOS CLAROS
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

    // Coordenadas estratégicas para colocar los iconos ilustrativos en el mapa
    const puntosInteres = [
        { lat: 17.5, lon: -103.5 },
        { lat: 18.5, lon: -105.5 },
        { lat: 15.5, lon: -102.0 },
        { lat: 19.2, lon: -107.0 }
    ];

    if (tipo === 'infrarrojo') {
        tituloLeyenda = "🛰️ Nubes y Masas Nubosas";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>☁️ Iconos de Nube:</b> Indican concentración densa de humedad y tormentas activas en la región.</div>';
        
        puntosInteres.forEach(pt => {
            const nubeIcon = L.divIcon({
                className: 'weather-emoji-icon',
                html: '<div style="font-size: 26px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">☁️⛈️</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: nubeIcon }));
        });
    } else if (tipo === 'vientos') {
        tituloLeyenda = "💨 Vectores e Intensidad de Viento";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>💨 / 🌀 Símbolos:</b> Muestran la dirección del flujo de aire y rachas fuertes en el litoral.</div>';
        
        // Mantenemos los vectores limpios que ya funcionaban bien y agregamos iconos de viento
        const centroLat = 16.8;
        const centroLon = -104.2;
        for (let i = 0; i < 10; i++) {
            let anguloOffset = (i * Math.PI) / 5;
            let ondaCoords = [];
            for (let d = 0.5; d <= 3.5; d += 0.5) {
                let lat = centroLat + (d * 0.8) * Math.sin(anguloOffset + d);
                let lon = centroLon + (d * 1.2) * Math.cos(anguloOffset + d);
                ondaCoords.push([lat, lon]);
            }
            groupLayers.push(L.polyline(ondaCoords, { color: '#38bdf8', weight: 3, opacity: 0.8 }));
        }

        puntosInteres.forEach(pt => {
            const vientoIcon = L.divIcon({
                className: 'weather-emoji-icon',
                html: '<div style="font-size: 24px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">💨</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: vientoIcon }));
        });
    } else if (tipo === 'precipitacion') {
        tituloLeyenda = "🌧️ Zonas de Lluvia y Tormenta";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>🌧️ / ⛈️ Iconos de Lluvia:</b> Ubican las zonas con aguaceros fuertes y riesgo de encharcamientos.</div>';
        
        puntosInteres.forEach(pt => {
            const lluviaIcon = L.divIcon({
                className: 'weather-emoji-icon',
                html: '<div style="font-size: 26px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">🌧️⚡</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: lluviaIcon }));
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

// =====================================================
//  CLIMA LOCAL Y ENLACES DIRECTOS A BOLETINES OFICIALES REALES
// =====================================================
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
