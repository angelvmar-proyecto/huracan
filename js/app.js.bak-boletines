let appState = {
    currentTab: 'trayectoria',
    map: null,
    markers: [],
    lines: [],
    activeRadarLayer: null,
    legendControl: null,
    ultimoFeed: null,
    origenDatos: null,
    climaIntervalId: null,
    nhcVisible: false,
    nhcOverlay: null
};

// Capas oficiales del NHC (identificadores extraídos del servicio)
const NHC_EXPORT_URL = 'https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather/MapServer/export';
const NHC_LAYERS = {
    // Cono de pronóstico — cuenca Atlántico (AT) y Pacífico (EP) y Central (CP)
    cono:  [8, 34, 60, 86, 112, 138, 164, 190, 216, 242, 268, 294, 320, 346, 372],
    track: [7, 33, 59, 85, 111, 137, 163, 189, 215, 241, 267, 293, 319, 345, 371],
    aviso: [9, 35, 61, 87, 113, 139, 165, 191, 217, 243, 269, 295, 321, 347, 373]
};

// OpenWeatherMap — key existente reutilizada
const OWM_KEY = 'eef21ac46e722ea8c4e66d51fd013e9f';
const UBICACION_FALLBACK = { lat: 21.1619, lon: -86.8515, nombre: 'Cancún' };

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

    // Refrescar el overlay del NHC cuando el mapa se mueve o hace zoom
    appState.map.on('moveend', () => {
        if (appState.nhcVisible) actualizarNHCOverlay();
    });

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

// =========================================================
//  CAPAS OFICIALES DEL NHC (Cono, Trayectoria, Avisos)
// =========================================================
function toggleNHC() {
    appState.nhcVisible = !appState.nhcVisible;
    const btn = document.getElementById('nhc-btn');
    if (!btn) return;

    if (!appState.nhcVisible) {
        if (appState.nhcOverlay) {
            appState.map.removeLayer(appState.nhcOverlay);
            appState.nhcOverlay = null;
        }
        btn.classList.remove('active', 'loading');
        btn.innerHTML = '🛰️';
        return;
    }

    btn.classList.add('active', 'loading');
    btn.innerHTML = '🛰️';
    actualizarNHCOverlay();
}

function actualizarNHCOverlay() {
    if (!appState.nhcVisible || !appState.map) return;

    const b = appState.map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const size = appState.map.getSize();

    // Orden de dibujo: primero cono (fondo), luego track (medio), luego avisos (arriba)
    const capas = [
        ...NHC_LAYERS.cono,
        ...NHC_LAYERS.track,
        ...NHC_LAYERS.aviso
    ].join(',');

    const url = NHC_EXPORT_URL
        + `?bbox=${sw.lng},${sw.lat},${ne.lng},${ne.lat}`
        + `&bboxSR=4326&imageSR=4326`
        + `&size=${size.x},${size.y}`
        + `&format=png32&transparent=true`
        + `&layers=show:${capas}`
        + `&f=image`;

    const btn = document.getElementById('nhc-btn');

    if (appState.nhcOverlay) {
        appState.map.removeLayer(appState.nhcOverlay);
    }

    appState.nhcOverlay = L.imageOverlay(url, b, {
        opacity: 0.9,
        interactive: false,
        className: 'nhc-overlay'
    });

    // Cuando la imagen carga (o falla), quitamos el estado de carga
    appState.nhcOverlay.on('load', () => {
        if (btn) btn.classList.remove('loading');
    });
    appState.nhcOverlay.on('error', () => {
        if (btn) {
            btn.classList.remove('loading');
            btn.style.borderColor = '#ef4444';
            setTimeout(() => { btn.style.borderColor = ''; }, 3000);
        }
    });

    appState.nhcOverlay.addTo(appState.map);
}

function initLocalWeather() {
    // 1. Pintar un esqueleto mientras llega la ubicación
    const cont = document.getElementById('panel-pronostico');
    if (!cont) return;
    cont.innerHTML = `
        <div class="panel-content-inner">
            <h2 class="titulo-panel" style="font-size:18px; margin-bottom:4px;">⛅ Clima local</h2>
            <div class="sub-texto" style="padding:20px; text-align:center;">⏳ Obteniendo ubicación…</div>
        </div>`;

    // 2. Intentar geolocalización; si falla, usar fallback
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => cargarClimaLocal(pos.coords.latitude, pos.coords.longitude, null),
            err => {
                console.warn('Geolocalización denegada, usando fallback:', err.message);
                cargarClimaLocal(UBICACION_FALLBACK.lat, UBICACION_FALLBACK.lon, UBICACION_FALLBACK.nombre);
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 }
        );
    } else {
        cargarClimaLocal(UBICACION_FALLBACK.lat, UBICACION_FALLBACK.lon, UBICACION_FALLBACK.nombre);
    }
}

async function cargarClimaLocal(lat, lon, nombreFallback) {
    const cont = document.getElementById('panel-pronostico');
    if (!cont) return;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&lang=es`;
        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();

        const temp = Math.round(d.main.temp);
        const tempMin = Math.round(d.main.temp_min);
        const tempMax = Math.round(d.main.temp_max);
        const sens = Math.round(d.main.feels_like);
        const hum = d.main.humidity;
        const pres = d.main.pressure;
        const vientoMs = d.wind.speed;
        const vientoNudos = Math.round(vientoMs * 1.94384);
        const desc = d.weather[0].description;
        const icono = d.weather[0].icon;
        const ciudad = nombreFallback || d.name || 'Tu ubicación';

        // Semáforo de viento (inspirado en banderas de playa)
        let estadoColor = '#10b981';
        let estadoTxt = 'Condiciones normales';
        if (vientoNudos >= 48) {
            estadoColor = '#ef4444';
            estadoTxt = 'Vientos de tormenta tropical';
        } else if (vientoNudos >= 34) {
            estadoColor = '#f59e0b';
            estadoTxt = 'Vientos fuertes';
        } else if (vientoNudos >= 22) {
            estadoColor = '#eab308';
            estadoTxt = 'Viento moderado';
        }

        cont.innerHTML = `
            <div class="panel-content-inner">
                <h2 class="titulo-panel" style="font-size:18px; margin-bottom:8px;">⛅ Clima local</h2>
                <p class="sub-texto" style="margin-bottom:12px; color:#8a7a5a;">
                    📍 ${ciudad}
                </p>

                <div class="card-option" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:14px;">
                    <img src="https://openweathermap.org/img/wn/${icono}@2x.png" style="width:64px; height:64px;" alt="${desc}">
                    <div style="flex:1;">
                        <div style="font-size:32px; font-weight:800; color:#fff;">${temp}°C</div>
                        <div class="sub-texto" style="text-transform:capitalize;">${desc}</div>
                        <div class="sub-texto" style="font-size:11px; margin-top:2px;">
                            Sensación ${sens}°C · Mín ${tempMin}° / Máx ${tempMax}°
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
                    <div class="card-option" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); text-align:center; padding:10px;">
                        <div class="sub-texto" style="font-size:11px;">Viento</div>
                        <div style="font-size:16px; font-weight:700; color:#fff; margin-top:2px;">${vientoNudos} kt</div>
                    </div>
                    <div class="card-option" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); text-align:center; padding:10px;">
                        <div class="sub-texto" style="font-size:11px;">Humedad</div>
                        <div style="font-size:16px; font-weight:700; color:#fff; margin-top:2px;">${hum}%</div>
                    </div>
                    <div class="card-option" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); text-align:center; padding:10px;">
                        <div class="sub-texto" style="font-size:11px;">Presión</div>
                        <div style="font-size:16px; font-weight:700; color:#fff; margin-top:2px;">${pres} hPa</div>
                    </div>
                    <div class="card-option" style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); text-align:center; padding:10px;">
                        <div class="sub-texto" style="font-size:11px;">Actualizado</div>
                        <div style="font-size:16px; font-weight:700; color:#fff; margin-top:2px;">
                            ${new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>

                <div class="card-option" style="margin-top:12px; background:${estadoColor}22; border:1px solid ${estadoColor}; padding:10px;">
                    <div style="font-size:13px; font-weight:700; color:${estadoColor};">
                        ${estadoTxt}
                    </div>
                    <div class="sub-texto" style="font-size:11px; margin-top:3px;">
                        Umbrales: >48 kt tormenta · >34 kt fuertes · >22 kt moderado
                    </div>
                </div>

                <div class="sub-texto" style="font-size:11px; margin-top:10px; text-align:center;">
                    Fuente: OpenWeatherMap · Datos informativos
                </div>
            </div>`;

        // Refrescar cada 10 minutos
        if (appState.climaIntervalId) clearInterval(appState.climaIntervalId);
        appState.climaIntervalId = setInterval(() => cargarClimaLocal(lat, lon, nombreFallback), 600000);

    } catch (e) {
        console.error('Error clima local:', e);
        cont.innerHTML = `
            <div class="panel-content-inner">
                <h2 class="titulo-panel" style="font-size:18px; margin-bottom:8px;">⛅ Clima local</h2>
                <div class="card-option" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4);">
                    <div style="color:#ef4444; font-weight:600;">⚠️ Sin conexión con OpenWeatherMap</div>
                    <div class="sub-texto" style="margin-top:4px;">${e.message}</div>
                </div>
            </div>`;
    }
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
    const btn = document.getElementById('nhc-btn');
    if (btn) btn.style.display = (tabId === 'trayectoria') ? 'flex' : 'none';

    if (tabId === 'trayectoria' && appState.map) {
        setTimeout(() => appState.map.invalidateSize(), 150);
    }
}
