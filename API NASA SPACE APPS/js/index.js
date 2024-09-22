// Configura el mapa
maptilersdk.config.apiKey = 'lwfEnXrctqTKuudqQNvP';
const map = new maptilersdk.Map({
    container: 'map', // ID del contenedor del mapa
    style: maptilersdk.MapStyle.STREETS, // Estilo del mapa
    center: [-5.5, 40.2125578], // Posición inicial [lng, lat]
    zoom: 5.5, // Zoom inicial
});

// URL del endpoint de eventos
const url = 'https://eonet.gsfc.nasa.gov/api/v3/events';

// Imágenes para cada categoría
const categoryImages = {
    "drought": "./icons/drought.png", // Imagen para sequía
    "dustHaze": "./icons/dust.png", // Imagen para niebla de polvo
    "earthquakes": "./icons/earthquakes.png", // Imagen para terremotos
    "floods": "./icons/floods.png", // Imagen para inundaciones
    "landslides": "./icons/landslides.png", // Imagen para deslizamientos de tierra
    "manmade": "./icons/manmade.png", // Imagen para eventos causados por el hombre
    "seaLakeIce": "./icons/seaLikeIce.png", // Imagen para hielo en mar/lago
    "severeStorms": "./icons/severeStorms.png", // Imagen para tormentas severas
    "snow": "./icons/snow.png", // Imagen para nieve
    "tempExtremes": "./icons/tempExtremes.png", // Imagen para extremos de temperatura
    "volcanoes": "./icons/volcanoes.png", // Imagen para volcanes
    "waterColor": "./icons/waterColor.png", // Imagen para agua
    "wildfires": "./icons/wildfires.png" // Imagen para incendios forestales
};

function createIconImage(imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '30px';  
    img.style.height = '30px'; 
    img.style.cursor = 'pointer'; 
    return img;
}

let markers = [];

function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

function filterEventsByDate(events) {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    return events.filter(event => {
        return event.geometry.some(geom => {
            const eventDate = new Date(geom.date);
            return eventDate >= startDate && eventDate <= endDate;
        });
    });
}

async function filterAndDisplayEvents() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        let events = data.events;

        if (startDateInput.value && endDateInput.value) {
            events = filterEventsByDate(events);
        }

        clearMarkers();

        events.forEach(event => {
            event.categories.forEach(category => {
                const imageUrl = categoryImages[category.id];
                if (imageUrl) {
                    event.geometry.forEach(async (geom) => {
                        const [lng, lat] = geom.coordinates;

                        const weatherUrl = await getWeatherUrl(lat, lng);

                        const popupContent = `
                            <div style="font-size: 14px;">
                                <strong>${event.title}</strong><br>
                                <em>Categoría: ${category.title}</em><br>
                                Fecha: ${new Date(geom.date).toLocaleDateString()}<br>
                                <a href="${weatherUrl}" target="_blank">Ver clima en tiempo real</a>
                            </div>
                        `;

                        const popup = new maptilersdk.Popup({ offset: 25 })
                            .setHTML(popupContent);

                        const marker = new maptilersdk.Marker({
                            element: createIconImage(imageUrl)
                        })
                        .setLngLat([lng, lat])
                        .setPopup(popup)
                        .addTo(map);

                        markers.push(marker);
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function showAllEvents() {
    startDateInput.value = '';
    endDateInput.value = '';
    await filterAndDisplayEvents();
}

const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

const filterButton = document.getElementById('filter-button');
const showAllButton = document.getElementById('show-all-button');

filterButton.addEventListener('click', filterAndDisplayEvents);
showAllButton.addEventListener('click', showAllEvents);

// Ejecutamos la función para mostrar los eventos al cargar
filterAndDisplayEvents();