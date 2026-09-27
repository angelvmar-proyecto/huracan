let appState = {
    currentTab: 'trayectoria',
    map: null,
    markers: [],
    lines: [],
    activeRadarLayer: null,
    legendControl: null,
    ultimoFeed: null
};

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initLocalWeather();
});

function initMap() {
    appState.map = L.map('map', { zoomControl: false }).setView([20.0, -98.0], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.map);
    L.control.zoom({ position: 'topright' }).addTo(appState.map);
    cargarDatosDinamicos();
}

async function cargarDatosDinamicos() {
    try {
        const r = await fetch('./clima_activo.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        appState.ultimoFeed = data;

        renderizarInfoCard(data);
        renderizarAlertasDinamicas(data.tormentas || []);

        if (data.hayCiclones && data.tormentas && data.tormentas.length > 0) {
            renderizarCiclones(data.tormentas);
        } else {
            limpiarMapa();
            mostrarAvisoInfo(
                "🛰️ Sin ciclones activos",
                data.actualizado
                    ? "El NHC no reporta sistemas tropicales activos en este momento."
                    : "Esperando la primera sincronización automática con el NHC."
            );
        }
    } catch (e) {
        console.error("Error al sincronizar datos:", e);
        limpiarMapa();
        mostrarAvisoInfo("⚠️ Sin conexión de datos", "No se pudo leer el archivo de ciclones. Reintentando en el próximo ciclo.");
    }
}

function limpiarMapa() {
    appState.markers.forEach(m => appState.map.removeLayer(m));
    appState.lines.forEach(l => appState.map.removeLayer(l));
    appState.markers = [];
    appState.lines = [];
}

function colorPorClasificacion(c) {
    switch ((c || '').toUpperCase()) {
        case 'TD': return '#3b82f6';
        case 'TS': return '#eab308';
        case 'HU': case 'MH': return '#dc2626';
        default:   return '#f97316';
    }
}

function rumboTexto(deg) {
    if (deg == null) return 'N/D';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
    return dirs[Math.round(((deg % 360) / 22.5)) % 16];
}

function renderizarCiclones(tormentas) {
    limpiarMapa();

    tormentas.forEach(t => {
        const lat = parseFloat(t.lat);
        const lon = parseFloat(t.lon);
        if (isNaN(lat) || isNaN(lon)) return;

        const color = colorPorClasificacion(t.classification);

        const icon = L.divIcon({
            className: 'custom-storm-marker',
            html: `<div style="background:${color};color:#fff;width:40px;height:40px;
                        border-radius:50%;display:flex;align-items:center;justify-content:center;
                        font-size:15px;font-weight:bold;box-shadow:0 0 15px ${color};
                        border:2.5px solid #fff;">🌀</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const popup = `
            <b>🌀 ${t.name || 'Sistema'}</b> <small>(${t.classification || 'N/D'})</small><br>
            <b>Viento:</b> ${t.intensity || 'N/D'} kt<br>
            <b>Presión:</b> ${t.pressure || 'N/D'} mb<br>
            <b>Posición:</b> ${lat.toFixed(2)}, ${lon.toFixed(2)}<br>
            <b>Movimiento:</b> ${rumboTexto(t.movementDir)} a ${t.movementSpeed || 'N/D'} kt<br>
            <small>Dato NHC: ${t.lastUpdate || 'N/D'}</small>
        `;

        const mk = L.marker([lat, lon], { icon }).addTo(appState.map).bindPopup(popup);
        appState.markers.push(mk);
    });

    if (appState.markers.length === 1) {
        appState.markers[0].openPopup();
        appState.map.setView(appState.markers[0].getLatLng(), 5);
    } else if (appState.markers.length > 1) {
        appState.map.fitBounds(L.featureGroup(appState.markers).getBounds().pad(0.3));
    }
}

function mostrarAvisoInfo(titulo, mensaje) {
    const card = L.marker([23.6345, -102.5528], {
        icon: L.divIcon({
            className: 'info-marker',
            html: `<div style="background:rgba(15,23,42,0.95);color:#fff;padding:12px 18px;
                        border-radius:8px;border:1px solid #10b981;font-size:13px;
                        text-align:center;box-shadow:0 4px 10px rgba(0,0,0,0.5);max-width:260px;">
                    <b>${titulo}</b><br>${mensaje}
                </div>`,
            iconSize: [260, 80],
            iconAnchor: [130, 40]
        })
    }).addTo(appState.map);
    appState.markers.push(card);
}

function renderizarInfoCard(data) {
    const card = document.getElementById('info-card-mapa');
    if (!card) return;

    if (!data.actualizado) {
        card.innerHTML = `
            <div class="titulo-panel" style="color:#f59e0b;">🛰️ Esperando primera sincronización</div>
            <div class="sub-texto" style="color:#fff; margin-top:2px;">
                Actualización automática cada 30 min desde NHC/NOAA.
            </div>`;
        card.style.display = 'block';
        return;
    }

    const fecha = new Date(data.actualizado);
    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
    const stale = minutos > 180;
    const color = stale ? '#ef4444' : '#10b981';
    const aviso = stale ? ' ⚠️ datos con más de 3 h' : '';

    if (data.hayCiclones && data.tormentas.length > 0) {
        const t = data.tormentas[0];
        const extra = data.tormentas.length > 1 ? ` (+${data.tormentas.length - 1} más)` : '';
        card.innerHTML = `
            <div class="titulo-panel" style="color:${color};">
                🌀 ${t.name} (${t.classification || 'N/D'})${extra}
            </div>
            <div class="sub-texto" style="color:#fff; margin-top:2px;">
                Fuente: NHC/NOAA · Actualizado hace ${minutos} min${aviso}
            </div>`;
    } else {
        card.innerHTML = `
            <div class="titulo-panel" style="color:${color};">
                ✅ Sin ciclones activos
            </div>
            <div class="sub-texto" style="color:#fff; margin-top:2px;">
                NHC/NOAA · Actualizado hace ${minutos} min${aviso}
            </div>`;
    }
    card.style.display = 'block';
}

function renderizarAlertasDinamicas(tormentas) {
    const cont = document.getElementById('lista-alertas-dinamicas');
    if (!cont) return;

    if (!tormentas.length) {
        cont.innerHTML = `<div class="sub-texto" style="padding:8px 0;">
            Sin sistemas activos reportados por el NHC. Consulta los boletines oficiales abajo.
        </div>`;
        return;
    }

    cont.innerHTML = tormentas.map(t => {
        const color = colorPorClasificacion(t.classification);
        return `
            <div class="alert-card warning" onclick="abrirBoletinOficial('smn')"
                 style="cursor:pointer; border-left:4px solid ${color}; margin-bottom:10px;">
                <div style="font-weight:bold; color:${color};">
                    🌀 ${t.name} (${t.classification || 'N/D'})
                </div>
                <div class="sub-texto" style="margin-top:4px;">
                    Viento: ${t.intensity || 'N/D'} kt · Presión: ${t.pressure || 'N/D'} mb ·
                    Movimiento: ${rumboTexto(t.movementDir)} a ${t.movementSpeed || 'N/D'} kt
                </div>
            </div>`;
    }).join('');
}

function aplicarCapaRadar(tipo) {
    if (appState.activeRadarLayer) {
        appState.map.removeLayer(appState.activeRadarLayer);
        appState.activeRadarLayer = null;
    }
    if (appState.legendControl) {
        appState.map.removeControl(appState.legendControl);
        appState.legendControl = null;
    }

    let titulo = "", html = "";
    const capas = [];

    if (tipo === 'infrarrojo') {
        titulo = "🛰️ Nubes (ilustrativo)";
        html = '<div style="font-size:11px;">Capa decorativa. No es imagen satelital en vivo.</div>';
        capas.push(L.marker([18.5, -95.0], {
            icon: L.divIcon({ className: 'w', html: '<div style="font-size:26px;">☁️⛈️</div>', iconSize: [30,30], iconAnchor: [15,15] })
        }));
    } else if (tipo === 'vientos') {
        titulo = "💨 Viento (ilustrativo)";
        html = '<div style="font-size:11px;">Capa decorativa. No es dato medido.</div>';
        capas.push(L.marker([18.5, -95.0], {
            icon: L.divIcon({ className: 'w', html: '<div style="font-size:26px;">💨</div>', iconSize: [30,30], iconAnchor: [15,15] })
        }));
    } else if (tipo === 'precipitacion') {
        titulo = "🌧️ Lluvia (ilustrativo)";
        html = '<div style="font-size:11px;">Capa decorativa. No es radar pluvial.</div>';
        capas.push(L.marker([18.5, -95.0], {
            icon: L.divIcon({ className: 'w', html: '<div style="font-size:26px;">🌧️⚡</div>', iconSize: [30,30], iconAnchor: [15,15] })
        }));
    }

    appState.activeRadarLayer = L.layerGroup(capas).addTo(appState.map);

    const LegendControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            const div = L.DomUtil.create('div', 'info-legend');
            div.style.background = 'rgba(15,23,42,0.95)';
            div.style.color = '#fff';
            div.style.padding = '10px 14px';
            div.style.borderRadius = '8px';
            div.style.border = '1px solid rgba(255,255,255,0.15)';
            div.innerHTML = `<b style="color:#f59e0b;font-size:12px;">${titulo}</b>
                <hr style="border:0;border-top:1px solid rgba(255,255,255,0.2);margin:4px 0;">
                ${html}
                <button onclick="this.parentElement.remove()"
                        style="background:none;border:none;color:#aaa;cursor:pointer;float:right;">×</button>`;
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
    const cont = document.getElementById('panel-pronostico');
    if (!cont) return;
    cont.innerHTML = `
        <div class="panel-content-inner">
            <h2 class="titulo-panel" style="font-size:18px; margin-bottom:4px;">📍 Estado del sistema</h2>
            <p class="sub-texto" style="margin-bottom:12px; color:#10b981; font-weight:500;">
                ✓ Sincronización automática activa
            </p>
            <div class="card-option" style="background:rgba(16,185,129,0.15);
                        border:1px solid rgba(16,185,129,0.4); margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:#10b981;">
                    <span>🌐 Fuente</span><span>NHC / NOAA</span>
                </div>
                <div class="sub-texto" style="margin-top:4px;">
                    La app descarga datos oficiales cada 30 minutos desde un servidor de GitHub.
                    Si no hay ciclones activos, se muestra explícitamente.
                </div>
            </div>
        </div>`;
}

function abrirBoletinOficial(tipo) {
    let url = "https://smn.conagua.gob.mx/es/ciclones-tropicales/cuenca-del-pacifico";
    if (tipo === 'puertos')       url = "https://www.gob.mx/semar";
    else if (tipo === 'aviso_general') url = "https://smn.conagua.gob.mx/es/";
    window.open(url, '_blank');
}

function switchTab(tabId, evt) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.weather-panel').forEach(p => p.classList.remove('active'));
    evt.currentTarget.classList.add('active');
    document.getElementById(`panel-${tabId}`).classList.add('active');
    appState.currentTab = tabId;
    if (tabId === 'trayectoria' && appState.map) {
        setTimeout(() => appState.map.invalidateSize(), 150);
    }
}
