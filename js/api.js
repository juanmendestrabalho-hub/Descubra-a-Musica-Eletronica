import { CONFIG } from './config.js';

export async function fetchEvents() {
    try {
        const response = await fetch(CONFIG.apiUrl);
        if (!response.ok) throw new Error('Falha ao carregar eventos da fonte.');
        const data = await response.json();
        // Simulação de padronização 
        return data.map(normalizeEvent);
    } catch (error) {
        console.error("Erro na API:", error);
        return [];
    }
}

function normalizeEvent(rawEvent) {
    // Garante que todos os eventos obedeçam ao contrato definido no prompt
    return {
        id: rawEvent.id || crypto.randomUUID(),
        title: rawEvent.title || 'Evento sem nome',
        dateStart: rawEvent.dateStart ? new Date(rawEvent.dateStart) : null,
        city: rawEvent.city || 'Local não informado',
        state: rawEvent.state || '',
        venue: rawEvent.venue || null,
        artists: rawEvent.artists || [],
        genres: rawEvent.genres || [],
        priceMin: rawEvent.priceMin || null,
        ticketStatus: rawEvent.ticketStatus || 'unavailable',
        image: rawEvent.image || CONFIG.placeholderImage,
        ticketUrl: rawEvent.ticketUrl || '#'
    };
}
