import { fetchEvents } from './api.js';
import { renderEvents } from './events.js';
import { setupSearch, removeAccents } from './search.js';
import { setupFilters, getFiltersState, filterEvents } from './filters.js';

let allEvents = [];
let currentSearchTerm = '';
let currentFilters = getFiltersState();

async function initApp() {
    document.getElementById('resultCount').textContent = "Carregando a cena eletrônica...";
    
    // 1. Busca os dados brutos (API / JSON)
    allEvents = await fetchEvents();
    
    // 2. Configura os Listeners
    setupSearch((term) => {
        currentSearchTerm = term;
        updateUI();
    });

    setupFilters((filters) => {
        currentFilters = filters;
        updateUI();
    });

    // 3. Renderização inicial
    updateUI();
}

function updateUI() {
    // Applica os filtros combinados (Search + Selects)
    const filteredEvents = filterEvents(allEvents, currentSearchTerm, currentFilters);
    
    // Ordenação: prioriza eventos mais próximos (Data)
    filteredEvents.sort((a, b) => {
        if (!a.dateStart) return 1;
        if (!b.dateStart) return -1;
        return a.dateStart - b.dateStart;
    });

    renderEvents(filteredEvents);
}


document.addEventListener('DOMContentLoaded', initApp);
