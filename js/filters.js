export function getFiltersState() {
    return {
        state: document.getElementById('stateFilter').value,
        genre: document.getElementById('genreFilter').value,
        maxPrice: document.getElementById('priceFilter').value
    };
}

export function setupFilters(onFilterChange) {
    const filters = ['stateFilter', 'genreFilter', 'priceFilter'];
    filters.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            onFilterChange(getFiltersState());
        });
    });
}

export function filterEvents(events, searchTerm, filters) {
    return events.filter(event => {
        // Filtro de Texto (Nome, Artistas, Cidade, Local)
        let matchesSearch = true;
        if (searchTerm) {
            const searchContext = `${event.title} ${event.city} ${event.venue || ''} ${event.artists.join(' ')} ${event.genres.join(' ')}`;
            matchesSearch = searchContext.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(searchTerm);
        }

        // Filtro de Estado
        const matchesState = filters.state ? event.state === filters.state : true;
        
        // Filtro de Gênero
        const matchesGenre = filters.genre ? event.genres.includes(filters.genre) : true;
        
        // Filtro de Preço
        let matchesPrice = true;
        if (filters.maxPrice) {
            if (event.priceMin === null) matchesPrice = false; // Se não tem preço e exige preço max, esconde
            else matchesPrice = event.priceMin <= parseFloat(filters.maxPrice);
        }

        return matchesSearch && matchesState && matchesGenre && matchesPrice;
    });
}
