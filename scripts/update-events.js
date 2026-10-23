const fs = require('fs');
const path = require('path');

// ==========================================
// 1. TICKETMASTER (API Pública Oficial)
// ==========================================
async function fetchTicketmaster() {
    console.log("🎟️ A procurar na Ticketmaster...");
    const token = process.env.TICKETMASTER_KEY;
    if (!token) return [];

    try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=Electronic&countryCode=BR&apikey=${token}`;
        const resposta = await fetch(url);
        if (!resposta.ok) return [];
        
        const dados = await resposta.json();
        if (!dados._embedded || !dados._embedded.events) return [];

        return dados._embedded.events.map(evento => ({
            id: `tm_${evento.id}`,
            title: evento.name,
            dateStart: evento.dates?.start?.dateTime || evento.dates?.start?.localDate,
            city: evento._embedded?.venues[0]?.city?.name || "Brasil",
            state: evento._embedded?.venues[0]?.state?.stateCode || "BR",
            venue: evento._embedded?.venues[0]?.name || "Local não informado",
            artists: [],
            genres: ["Eletrônica", "Festival"],
            priceMin: null,
            ticketStatus: "available",
            image: evento.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600",
            ticketUrl: evento.url
        }));
    } catch (e) {
        return [];
    }
}

// ==========================================
// 2. BANDSINTOWN (API Pública de Artistas)
// ==========================================
async function fetchBandsintown() {
    console.log("🎧 A procurar agendas de DJs no Bandsintown...");
    
    // REDE GIGANTE DE DJS PARA TESTAR!
    const djs = [
        "Vintage Culture", "Alok", "Amelie Lens", "Astrix", 
        "Mochakk", "Boris Brejcha", "Charlotte de Witte", 
        "Peggy Gou", "Gabe", "Illusionize", "Victor Lou", 
        "Anna", "KVSH", "Cat Dealers", "Dubdogz"
    ];
    let eventosEncontrados = [];

    for (const dj of djs) {
        try {
            const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(dj)}/events?app_id=ravefinder_brasil`;
            const resposta = await fetch(url);
            if (!resposta.ok) continue;

            const dados = await resposta.json();
            if (Array.isArray(dados)) {
                // Filtra para garantir que só traz eventos no Brasil
                const eventosBr = dados.filter(e => e.venue?.country === "Brazil");
                
                const formatados = eventosBr.map(evento => ({
                    id: `bit_${evento.id}`,
                    title: `${dj} @ ${evento.venue?.city}`,
                    dateStart: evento.datetime,
                    city: evento.venue?.city || "Brasil",
                    state: evento.venue?.region || "BR",
                    venue: evento.venue?.name || "Clube",
                    artists: [dj],
                    genres: ["Eletrônica"],
                    priceMin: null,
                    ticketStatus: "available",
                    image: "https://images.unsplash.com/photo-1540039155732-61ee4f308801?q=80&w=600",
                    ticketUrl: evento.url
                }));
                eventosEncontrados = eventosEncontrados.concat(formatados);
            }
        } catch (e) {
            // Ignora falhas de um DJ e avança para o próximo
        }
    }
    return eventosEncontrados;
}

// ==========================================
// 3. SYMPLA & SHOTGUN (Engenharia Reversa)
// ==========================================
async function fetchSympla() {
    console.log("🔍 A tentar Sympla (Engenharia Reversa)...");
    const token = process.env.SYMPLA_TOKEN || '';
    try {
        const resposta = await fetch('https://public-api.sympla.com.br/v3/events?category_id=4', {
            headers: { 's_token': token, 'User-Agent': 'Mozilla/5.0' }
        });
        if (!resposta.ok) return [];
        const json = await resposta.json();
        if (!json.data) return [];
        return json.data.map(evento => ({
            id: `sympla_${evento.id}`,
            title: evento.name,
            dateStart: evento.start_date,
            city: evento.location?.city || "BR",
            state: evento.location?.state || "BR",
            venue: evento.location?.name || "Local",
            artists: [], genres: ["Eletrônica"], priceMin: null, ticketStatus: "available",
            image: evento.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
            ticketUrl: evento.url
        }));
    } catch (e) { return []; }
}

// ==========================================
// ORQUESTRADOR: EXECUTA TUDO EM PARALELO
// ==========================================
async function atualizarEventos() {
    console.log("🤖 A INICIAR O SUPER MOTOR DE BUSCA EM PARALELO...");

    const resultados = await Promise.all([
        fetchTicketmaster(),
        fetchBandsintown(),
        fetchSympla()
    ]);

    let todosOsEventos = resultados.flat();

    console.log(`📡 Resultados brutos obtidos: ${todosOsEventos.length} eventos globais.`);

    if (todosOsEventos.length === 0) {
        console.log("⚠️ Nenhuma API retornou dados. A carregar o Plano B (Festivais Nacionais)...");
        todosOsEventos = [
            {
                "id": "e001",
                "title": "Universo Paralello 2026/2027",
                "dateStart": "2026-12-27T16:00:00-03:00",
                "city": "Ituberá",
                "state": "BA",
                "venue": "Praia de Pratigi",
                "artists": ["Alok", "Astrix", "Vegas"],
                "genres": ["Psytrance", "Techno"],
                "priceMin": 850.00,
                "ticketStatus": "available",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600",
                "ticketUrl": "https://www.ingresse.com"
            },
            {
                "id": "e002",
                "title": "Time Warp Brasil",
                "dateStart": "2026-05-01T20:00:00-03:00",
                "city": "São Paulo",
                "state": "SP",
                "venue": "Vale do Anhangabaú",
                "artists": ["Charlotte de Witte", "Vintage Culture"],
                "genres
