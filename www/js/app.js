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
    // Centrado panorámico para abarcar todo el continente americano (Pacífico, Golfo, Caribe, EE.UU. y Atlántico)
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([24.0, -90.0], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.map);

    L.control.zoom({ position: 'topright' }).addTo(appState.map);

    renderActiveStorms();
}

function renderActiveStorms() {
    appState.markers.forEach(m => appState.map.removeLayer(m));
    appState.lines.forEach(l => appState.map.removeLayer(l));
    appState.markers = [];
    appState.lines = [];

    // =========================================================
    // 1. HURACÁN POLO (Pacífico - Cat. 4/5)
    // =========================================================
    dibujarSistemaCiclones(
        "Huracán Polo (Pacífico)", 
        16.8, -104.2, 
        '#dc2626', '4', 
        [[16.8, -104.2], [17.8, -107.0], [19.5, -110.5], [21.8, -114.5]], 
        [[16.2, -103.8], [17.4, -103.5], [23.0, -113.0], [20.5, -116.5], [15.8, -105.0]], 
        [
            { lat: 17.8, lon: -107.0, label: 'M', time: '+12h' },
            { lat: 19.5, lon: -110.5, label: 'H', time: '+24h' },
            { lat: 21.8, lon: -114.5, label: 'T', time: '+48h' }
        ],
        "Desplazamiento al NO a 14 km/h"
    );

    // =========================================================
    // 2. HURACÁN ODALYS (Pacífico Abierto)
    // =========================================================
    dibujarSistemaCiclones(
        "Huracán Odalys (Pacífico Norte)", 
        22.5, -122.0, 
        '#3b82f6', '1', 
        [[22.5, -122.0], [24.0, -125.0], [26.2, -129.5]], 
        [[21.8, -121.5], [23.2, -121.0], [27.5, -128.5], [25.0, -131.0]], 
        [
            { lat: 24.0, lon: -125.0, label: 'H', time: '+12h' },
            { lat: 26.2, lon: -129.5, label: 'T', time: '+24h' }
        ],
        "Desplazamiento al ONO a 18 km/h"
    );

    // =========================================================
    // 3. TORMENTA TROPICAL / CARIBE Y GOLFO DE MÉXICO
    // =========================================================
    dibujarSistemaCiclones(
        "Sistema Caribe / Golfo", 
        18.5, -88.0, 
        '#10b981', 'TT', 
        [[18.5, -88.0], [21.0, -90.5], [24.5, -93.0]], 
        [[17.5, -87.0], [19.5, -86.5], [26.0, -92.0], [23.0, -95.0]], 
        [
            { lat: 21.0, lon: -90.5, label: 'T', time: '+12h' },
            { lat: 24.5, lon: -93.0, label: 'H', time: '+24h' }
        ],
        "Desplazamiento al Norte a 16 km/h"
    );

    // =========================================================
    // 4. HURACÁN EN EL ATLÁNTICO / COSTA ESTE DE ESTADOS UNIDOS
    // =========================================================
    dibujarSistemaCiclones(
        "Huracán Atlántico (Costa Este EE.UU.)", 
        28.0, -70.0, 
        '#8b5cf6', '3', 
        [[28.0, -70.0], [31.5, -74.0], [35.0, -76.5]], 
        [[27.0, -68.5], [29.5, -67.5], [37.0, -74.5], [33.5, -79.0]], 
        [
            { lat: 31.5, lon: -74.0, label: 'H', time: '+12h' },
            { lat: 35.0, lon: -76.5, label: 'M', time: '+24h' }
        ],
        "Desplazamiento al NNE a 22 km/h"
    );
}

function dibujarSistemaCiclones(nombre, lat, lon, colorHex, badgeTexto, trayectoriaCoords, conoCoords, secuenciales, velocidadTraslacion) {
    const cono = L.polygon(conoCoords, {
        color: colorHex,
        weight: 1.5,
        fillColor: colorHex,
        fillOpacity: 0.16,
        dashArray: '4, 4'
    }).addTo(appState.map);
    appState.lines.push(cono);

    const lineaTrayectoria = L.polyline(trayectoriaCoords, {
        color: colorHex,
        weight: 3.5,
        opacity: 0.9
    }).addTo(appState.map);
    appState.lines.push(lineaTrayectoria);

    secuenciales.forEach(pt => {
        const seqIcon = L.divIcon({
            className: 'sequential-marker',
            html: `<div style="background: white; color: ${colorHex}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid ${colorHex}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${pt.label}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        const markerSeq = L.marker([pt.lat, pt.lon], { icon: seqIcon })
            .addTo(appState.map)
            .bindPopup(`<b>Pronóstico (${pt.time})</b><br>${nombre}`);
        appState.markers.push(markerSeq);
    });

    const iconoPrincipal = L.divIcon({
        className: 'custom-storm-marker',
        html: `<div style="background: ${colorHex}; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 0 12px ${colorHex}; border: 2px solid #fff;">${badgeTexto}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    const marker = L.marker([lat, lon], { icon: iconoPrincipal })
        .addTo(appState.map)
        .bindPopup(`<b>🌀 ${nombre}</b><br><b>Posición Actual (Emisión Oficial)</b><br>🏃‍♂️ ${velocidadTraslacion}<br>🕒 Actualizado: 26 SEP 2026 - 15:00 UTC`);
    
    appState.markers.push(marker);
}

// =====================================================
//  CAPAS VISUALES Y CLIMA LOCAL / PANORÁMICO
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
        { lat: 21.0, lon: -90.5 },
        { lat: 31.5, lon: -74.0 },
        { lat: 24.0, lon: -125.0 }
    ];

    if (tipo === 'infrarrojo') {
        tituloLeyenda = "🛰️ Nubes y Masas Nubosas (Américas)";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>☁️ Iconos:</b> Convección activa en Pacífico, Golfo, Caribe y Atlántico.</div>';
        puntosInteres.forEach(pt => {
            const icono = L.divIcon({
                className: 'weather-emoji',
                html: '<div style="font-size: 24px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">☁️⛈️</div>',
                iconSize: [30, 30], iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: icono }));
        });
    } else if (tipo === 'vientos') {
        tituloLeyenda = "💨 Vectores de Viento Continental";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>💨 Símbolos:</b> Flujos de viento y corrientes en las cuencas americanas.</div>';
        puntosInteres.forEach(pt => {
            const icono = L.divIcon({
                className: 'weather-emoji',
                html: '<div style="font-size: 24px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">💨</div>',
                iconSize: [30, 30], iconAnchor: [15, 15]
            });
            groupLayers.push(L.marker([pt.lat, pt.lon], { icon: icono }));
        });
    } else if (tipo === 'precipitacion') {
        tituloLeyenda = "🌧️ Zonas de Precipitación";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>🌧️ Símbolos:</b> Lluvias asociadas a ciclones en el continente.</div>';
        puntosInteres.forEach(pt => {
            const icono = L.divIcon({
                className: 'weather-emoji',
                html: '<div style="font-size: 24px; text-shadow: 0 0 8px rgba(0,0,0,0.8);">🌧️⚡</div>',
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
                <h2 class="titulo-panel" style="font-size: 18px; margin-bottom: 4px;">🌎 Monitoreo Panorámico (Las Américas)</h2>
                <p class="sub-texto" style="margin-bottom: 12px; color: #f59e0b; font-weight: 500;">🕒 Boletín Conjunto SMN / NHC: 26 SEP 2026 - 15:00 UTC</p>

                <div class="card-option" style="background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.4); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #ef4444;">
                        <span>🌊 Pacífico (Polo / Odalys)</span>
                        <span>Cat. 4/5 y Cat. 1</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 4px;">🏃‍♂️ <b>Traslación:</b> 14 - 18 km/h al Nor-Oeste</div>
                </div>

                <div class="card-option" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #10b981;">
                        <span>🌴 Caribe y Golfo de México</span>
                        <span>Perturbación Activa</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 4px;">🏃‍♂️ <b>Traslación:</b> 16 km/h hacia el Norte</div>
                </div>

                <div class="card-option" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #8b5cf6;">
                        <span>⚡ Atlántico / Costa Este EE.UU.</span>
                        <span>Huracán Cat. 3</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 4px;">🏃‍♂️ <b>Traslación:</b> 22 km/h al NNE (NHC Track)</div>
                </div>
            </div>
        `;
    }
}

function abrirBoletinOficial(tipo) {
    let urlOficial = "https://smn.conagua.gob.mx/es/ciclones-tropicales/cuenca-del-pacifico";
    if (tipo === 'nhc') {
        urlOficial = "https://www.nhc.noaa.gov/";
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
