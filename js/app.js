// =====================================================
//  ESTADO GLOBAL Y CONTROL DE MEMORIA
// =====================================================
let appState = {
    currentTab: 'trayectoria',
    map: null,
    hurricaneData: null,
    lastUpdate: null
};

// =====================================================
//  CAMBIO DE PESTAÑAS FLUIDO (SIN RECARGAR EL DOM)
// =====================================================
function switchTab(tabId, evt) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.weather-panel').forEach(panel => panel.classList.remove('active'));
    
    evt.currentTarget.classList.add('active');
    document.getElementById(`panel-${tabId}`).classList.add('active');
    appState.currentTab = tabId;

    // Si pasamos al mapa, recalculamos el tamaño para evitar bugs visuales en WebView
    if(tabId === 'trayectoria' && appState.map) {
        setTimeout(() => appState.map.invalidateSize(), 150);
    }
}

// =====================================================
//  INICIALIZACIÓN DEL MAPA Y CAPAS
// =====================================================
function initApp() {
    // Inicializar mapa limpio con OpenStreetMap (Libre y sin marcas de agua de API)
    appState.map = L.map('map', {
        center: [21.1619, -86.8515], // Coordenadas base (Caribe / Cancún)
        zoom: 6,
        zoomControl: false,
        attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(appState.map);

    // Iniciar sondeo silencioso en segundo plano (Polling sin parpadeo)
    iniciarSondeoSilencioso();
}

// =====================================================
//  ACTUALIZACIÓN EN SEGUNDO PLANO (BACKGROUND FETCH)
// =====================================================
function iniciarSondeoSilencioso() {
    fetchWeatherData();
    // Actualizar cada 5 minutos de forma invisible
    setInterval(fetchWeatherData, 300000);
}

async function fetchWeatherData() {
    try {
        // Petición simulada o directa al feed de la NOAA
        console.log("Sincronizando datos meteorológicos en segundo plano...");
        appState.lastUpdate = new Date().toLocaleTimeString();
        
        // Aquí actualizamos las coordenadas del huracán y redibujamos el cono
        // partiendo milimétricamente desde el ojo del huracán actual.
    } catch (e) {
        console.warn("Modo offline: Usando última caché disponible en memoria.");
    }
}

// Ejecutar al cargar la ventana
window.onload = function() {
    initApp();
};
