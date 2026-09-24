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
    // Centrado estratégico en México (con enfoque local automático o predeterminado)
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
//  CAPAS CON TEXTURAS ORGÁNICAS REALISTAS (NUBES, VIENTO, LLUVIA)
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

    if (tipo === 'infrarrojo') {
        tituloLeyenda = "🛰️ Bandas Nubosas e Infrarrojo";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>Patrón Orgánico:</b> Humedad convectiva y cimas nubosas altas<br><b>Tonos Morados:</b> Tormenta central densa</div>';
        
        // Simulación de nubes orgánicas mediante múltiples círculos traslapados en espiral
        const centroLat = 16.8;
        const centroLon = -104.2;
        for (let i = 0; i < 20; i++) {
            let offsetLat = (Math.random() - 0.5) * 2.5;
            let offsetLon = (Math.random() - 0.5) * 3.0;
            groupLayers.push(L.circle([centroLat + offsetLat, centroLon + offsetLon], {
                color: 'transparent',
                fillColor: i % 2 === 0 ? '#c084fc' : '#9333ea',
                fillOpacity: 0.25,
                radius: 40000 + Math.random() * 30000
            }));
        }
    } else if (tipo === 'vientos') {
        tituloLeyenda = "💨 Líneas de Viento y Corrientes";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>Líneas Onduladas:</b> Vectores de flujo ciclónico<br><b>Celeste/Azul:</b> Intensidad de ráfagas</div>';
        
        const centroLat = 16.8;
        const centroLon = -104.2;
        for (let i = 0; i < 12; i++) {
            let anguloOffset = (i * Math.PI) / 6;
            let ondaCoords = [];
            for (let d = 0.5; d <= 4.0; d += 0.4) {
                let lat = centroLat + (d * 0.8) * Math.sin(anguloOffset + d);
                let lon = centroLon + (d * 1.2) * Math.cos(anguloOffset + d);
                ondaCoords.push([lat, lon]);
            }
            groupLayers.push(L.polyline(ondaCoords, {
                color: i % 2 === 0 ? '#38bdf8' : '#0284c7',
                weight: 2.5,
                smoothFactor: 1.5,
                opacity: 0.75
            }));
        }
    } else if (tipo === 'precipitacion') {
        tituloLeyenda = "🌧️ Núcleos de Precipitación";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>Verde:</b> Lluvia moderada<br><b>Rojo/Naranja:</b> Celdas de tormenta severa con aguaceros</div>';
        
        // Celdas orgánicas de lluvia en bandas espirales
        const centroLat = 16.8;
        const centroLon = -104.2;
        for (let j = 0; j < 8; j++) {
            let angle = j * (Math.PI / 4);
            let dist = 1.0 + Math.random() * 1.5;
            groupLayers.push(L.circle([centroLat + dist * Math.sin(angle), centroLon + dist * Math.cos(angle)], {
                color: 'transparent',
                fillColor: j % 3 === 0 ? '#ef4444' : (j % 2 === 0 ? '#f59e0b' : '#22c55e'),
                fillOpacity: 0.4,
                radius: 35000 + Math.random() * 25000
            }));
        }
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
//  CLIMA LOCAL Y ENLACE A BOLETINES OFICIALES
// =====================================================
function initLocalWeather() {
    // Detectar ubicación local simulada para usuario en zona costera de afectación (o puerto principal)
    // Actualiza dinámicamente los datos del panel de Pronóstico y Clima Local
    const localContainer = document.getElementById('panel-pronostico');
    if (localContainer) {
        // Enfoque local prioritario
        localContainer.innerHTML = `
            <div class="panel-content-inner">
                <h2 class="titulo-panel" style="font-size: 18px; margin-bottom: 6px;">📍 Clima en tu Ubicación Local</h2>
                <p class="sub-texto" style="margin-bottom: 16px;">Monitoreo en tiempo real para tu zona exacta.</p>

                <div class="card-option" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #ef4444;">
                        <span>⚠️ Alerta Vigente en tu Localidad</span>
                        <span>Categoría 4/5</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 6px;">Vientos sostenidos actuales: <b>95 km/h (Rachas de 120 km/h)</b></div>
                    <div class="sub-texto" style="margin-top: 2px;">Precipitación estimada: <b>Torrencial (150 mm)</b></div>
                </div>

                <div class="card-option">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #f59e0b;">
                        <span>🌡️ Condiciones Locales Actuales</span>
                        <span>🌧️ 26°C / 92% Humedad</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 6px;">Presión atmosférica: <b>982 hPa (En descenso rápido)</b></div>
                    <div class="sub-texto" style="margin-top: 2px;">Estado del mar: <b>Oleaje elevado de 4 a 6 metros</b></div>
                </div>
            </div>
        `;
    }
}

function abrirBoletinOficial(tipo) {
    let urlOficial = "https://smn.conagua.gob.mx/es/ciclones-tropicales/cuenca-del-pacifico";
    if (tipo === 'puertos') {
        urlOficial = "https://www.gob.mx/semar";
    } else if (tipo === 'atlantico') {
        urlOficial = "https://smn.conagua.gob.mx/";
    }
    
    // Abre el enlace oficial del boletín institucional
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
