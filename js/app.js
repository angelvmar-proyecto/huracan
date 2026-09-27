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
    // Vista amplia y óptima para el territorio nacional y cuencas circundantes
    appState.map = L.map('map', {
        zoomControl: false
    }).setView([20.0, -98.0], 5);

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
    // LISTA GENERALIZADA DE SISTEMAS (ACTUALES Y FUTUROS)
    // =========================================================
    const sistemasActivos = [
        {
            nombre: "Huracán Polo",
            lat: 16.8,
            lon: -104.2,
            color: '#dc2626',
            badge: '4',
            trayectoria: [
                [16.8, -104.2],
                [18.2, -107.5],
                [20.0, -111.0],
                [22.2, -115.5]
            ],
            cono: [
                [16.8, -104.2], [17.5, -106.8], [19.2, -110.5], [21.8, -115.0],
                [22.6, -116.0], [20.8, -111.5], [18.8, -107.8], [16.2, -104.5]
            ],
            secuenciales: [
                { lat: 18.2, lon: -107.5, label: 'M', time: '+12h' },
                { lat: 20.0, lon: -111.0, label: 'H', time: '+24h' },
                { lat: 22.2, lon: -115.5, label: 'T', time: '+48h' }
            ],
            traslacion: "Desplazamiento al Nor-Oeste a 14 km/h"
        },
        {
            nombre: "Huracán Odalys",
            lat: 22.5,
            lon: -120.0,
            color: '#3b82f6',
            badge: '1',
            trayectoria: [
                [22.5, -120.0],
                [24.2, -123.5],
                [26.5, -127.5]
            ],
            cono: [
                [22.5, -120.0], [23.8, -123.2], [26.1, -127.2],
                [26.9, -127.8], [24.5, -123.8], [21.9, -120.5]
            ],
            secuenciales: [
                { lat: 24.2, lon: -123.5, label: 'H', time: '+12h' },
                { lat: 26.5, lon: -127.5, label: 'T', time: '+24h' }
            ],
            traslacion: "Desplazamiento al ONO a 18 km/h"
        },
        {
            nombre: "Perturbación Tropical (Caribe)",
            lat: 16.5,
            lon: -84.5,
            color: '#10b981',
            badge: 'TT',
            trayectoria: [
                [16.5, -84.5],
                [18.5, -86.8],
                [21.0, -89.2]
            ],
            cono: [
                [16.5, -84.5], [18.2, -86.5], [20.7, -88.9],
                [21.3, -89.5], [18.8, -87.1], [16.0, -84.8]
            ],
            secuenciales: [
                { lat: 18.5, lon: -86.8, label: 'T', time: '+18h' },
                { lat: 21.0, lon: -89.2, label: 'H', time: '+36h' }
            ],
            traslacion: "Desplazamiento al Norte a 16 km/h"
        }
    ];

    // Renderizar cada sistema aplicando la misma geometría institucional limpia
    sistemasActivos.forEach(sys => {
        // Cono de incertidumbre
        const conoPoly = L.polygon(sys.cono, {
            color: sys.color,
            weight: 1.5,
            fillColor: sys.color,
            fillOpacity: 0.3,
            dashArray: '5, 5'
        }).addTo(appState.map);
        appState.lines.push(conoPoly);

        // Línea central de trayectoria
        const lineaP = L.polyline(sys.trayectoria, {
            color: sys.color,
            weight: 4,
            opacity: 0.95
        }).addTo(appState.map);
        appState.lines.push(lineaP);

        // Puntos secuenciales (M, H, T)
        sys.secuenciales.forEach(pt => {
            const seqIcon = L.divIcon({
                className: 'sequential-marker',
                html: `<div style="background: white; color: ${sys.color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 2.5px solid ${sys.color}; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">${pt.label}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            const markerSeq = L.marker([pt.lat, pt.lon], { icon: seqIcon })
                .addTo(appState.map)
                .bindPopup(`<b>Pronóstico (${pt.time})</b><br>${sys.nombre}`);
            appState.markers.push(markerSeq);
        });

        // Marcador principal (Ojo actual del sistema)
        const principalIcon = L.divIcon({
            className: 'custom-storm-marker',
            html: `<div style="background: ${sys.color}; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; box-shadow: 0 0 15px ${sys.color}; border: 2.5px solid #fff;">${sys.badge}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const mainMarker = L.marker([sys.lat, sys.lon], { icon: principalIcon })
            .addTo(appState.map)
            .bindPopup(`<b>🌀 ${sys.nombre}</b><br><b>Posición Actual (Emisión Oficial)</b><br>🏃‍♂️ ${sys.traslacion}<br>🕒 Actualizado: 26 SEP 2026 - 15:00 UTC`);
        
        appState.markers.push(mainMarker);
    });
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
        { lat: 18.2, lon: -107.5 },
        { lat: 18.5, lon: -86.8 },
        { lat: 24.2, lon: -123.5 }
    ];

    if (tipo === 'infrarrojo') {
        tituloLeyenda = "🛰️ Nubes y Masas Nubosas";
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>☁️ Iconos:</b> Convección profunda y bandas espirales activas.</div>';
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
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>💨 Símbolos:</b> Flujo ciclónico y rachas intensas.</div>';
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
        htmlLeyenda = '<div style="font-size:11px; line-height:1.4;"><b>🌧️ Símbolos:</b> Tormentas severas y acumulados de lluvia.</div>';
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
                <h2 class="titulo-panel" style="font-size: 18px; margin-bottom: 4px;">📍 Clima Local y Emisión Oficial</h2>
                <p class="sub-texto" style="margin-bottom: 12px; color: #f59e0b; font-weight: 500;">🕒 Último Boletín SMN/CONAGUA: 26 SEP 2026 - 15:00 UTC</p>

                <div class="card-option" style="background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.4); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #ef4444;">
                        <span>🌊 Huracán Polo (Pacífico)</span>
                        <span>Cat. 4/5</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 4px;">🏃‍♂️ <b>Traslación:</b> Nor-Oeste a 14 km/h</div>
                </div>

                <div class="card-option" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #10b981;">
                        <span>🌴 Perturbación Caribe</span>
                        <span>Vigilancia Activa</span>
                    </div>
                    <div class="sub-texto" style="margin-top: 4px;">🏃‍♂️ <b>Traslación:</b> Norte a 16 km/h</div>
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
