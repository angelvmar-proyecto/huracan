const CONFIG = {
    PROXY: 'https://proxy-huracan.angelvmar.workers.dev/?url=',
    ENDPOINT: 'https://www.nhc.noaa.gov/CurrentStorms.json'
};

let mapa, marcadoresTormentas = [];
let userLat = 21.1619, userLon = -86.8515; // Cancún / Base

function iniciarMapa() {
    mapa = L.map('map', {
        center: [userLat, userLon],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapa);

    L.circleMarker([userLat, userLon], {
        radius: 8,
        color: '#d4a843',
        weight: 3,
        fillColor: '#d4a843',
        fillOpacity: 0.4
    }).addTo(mapa).bindPopup('📍 Cancún / Base');

    cargarTormentas();
}

async function cargarTormentas() {
    const container = document.getElementById('tormentas-activas');
    const estadoBadge = document.getElementById('estado');
    container.innerHTML = '<div class="loading">⏳ Sincronizando datos...</div>';
    estadoBadge.textContent = '🟡 CONSULTANDO';

    try {
        const urlFinal = CONFIG.PROXY + encodeURIComponent(CONFIG.ENDPOINT);
        const respuesta = await fetch(urlFinal);
        
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        
        const data = await respuesta.json();
        procesarYMostrarTormentas(data);
        estadoBadge.textContent = '🟢 CONECTADO';
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        container.innerHTML = `<div style="color:#ff6666;text-align:center;font-size:12px;">❌ Error de conexión con la API o Cloudflare.</div>`;
        estadoBadge.textContent = '🔴 ERROR';
    }
}

function procesarYMostrarTormentas(data) {
    const container = document.getElementById('tormentas-activas');
    const features = data.features || data.activeStorms || [];

    marcadoresTormentas.forEach(m => mapa.removeLayer(m));
    marcadoresTormentas = [];

    if (features.length === 0) {
        container.innerHTML = `<div style="text-align:center;color:#00cc44;font-size:13px;padding:8px;">✅ No hay tormentas activas en este momento.</div>`;
        return;
    }

    let html = '';

    features.forEach(f => {
        const p = f.properties || f;
        const coords = f.geometry?.coordinates || [p.lon || 0, p.lat || 0];
        
        const nombre = p.NAME || p.name || 'Sistema sin nombre';
        const categoria = p.CATEGORY || p.category || p.cat || 'Desconocida';
        const viento = p.WIND || p.windSpeed || p.wind || 'N/A';
        const presion = p.PRESSURE || p.pressure || 'N/A';
        
        const lat = coords[1] || userLat;
        const lon = coords[0] || userLon;

        let icono = '🌀';
        let claseCat = 'cat-huracan';
        const catLower = String(categoria).toLowerCase();

        if (catLower.includes('tropical storm') || catLower.includes('tormenta')) {
            icono = '🌪️';
            claseCat = 'cat-tormenta';
        } else if (catLower.includes('depression') || catLower.includes('depresion')) {
            icono = '🌧️';
            claseCat = 'cat-depresion';
        }

        html += `
            <div class="tormenta-card">
                <div class="icono">${icono}</div>
                <div class="info">
                    <div class="nombre">${nombre}</div>
                    <span class="categoria ${claseCat}">Cat: ${categoria}</span>
                    <div style="font-size:11px;color:#8a7a5a;margin-top:2px;">💨 Viento: ${viento} nudos · 🔽 ${presion} hPa</div>
                </div>
            </div>
        `;

        if (lat !== 0 && lon !== 0) {
            const marker = L.marker([lat, lon]).addTo(mapa)
                .bindPopup(`<b>${nombre}</b><br>Categoría: ${categoria}<br>Viento: ${viento} nudos`);
            marcadoresTormentas.push(marker);
        }
    });

    container.innerHTML = html;
}

window.onload = function() {
    iniciarMapa();
};
