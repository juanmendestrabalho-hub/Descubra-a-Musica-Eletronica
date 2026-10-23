const fs = require('fs');
const path = require('path');

// 1. BANDSINTOWN (API Pública Sem Chave)
async function fetchBandsintown() {
    console.log("🎧 A procurar no Bandsintown...");
    const djs = ["Vintage Culture", "Alok", "Amelie Lens", "Astrix", "Mochakk"];
    let eventos = [];
    for (const dj of djs) {
        try {
            const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(dj)}/events?app_id=ravefinder_app`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const dados = await res.json();
            if (Array.isArray(dados)) {
                const eventosBr = dados.filter(e => e.venue?.country === "Brazil");
                eventos = eventos.concat(eventosBr.map(e => ({
                    id: `bit_${e.id}`,
                    title: `${dj} @ ${e.venue?.city}`,
                    dateStart: e.datetime,
                    city: e.venue?.city || "Brasil",
                    state: e.venue?.region || "BR",
                    venue: e.venue?.name || "Local",
                    artists: [dj],
                    genres: ["Eletrônica"],
                    priceMin: null,
                    ticketStatus: "available",
                    image: "https://images.unsplash.com/photo-1540039155732-61ee4f308801?q=80&w=600&auto=format&fit=crop",
                    ticketUrl: e.url || "#"
                })));
            }
        } catch (e) {}
    }
    return eventos;
}

// 2. RESIDENT ADVISOR (API Pública Sem Chave)
async function fetchResidentAdvisor() {
    console.log("🕺 A procurar no Resident Advisor...");
    try {
        const url = 'https://ra.co/graphql';
        const query = `query { eventListings(countryId: 31) { data { id title date venue { name } city { name } } } }`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
            body: JSON.stringify({ query })
        });
        if (!res.ok) return [];
        const json = await res.json();
        if (!json.data || !json.data.eventListings || !json.data.eventListings.data) return [];
        return json.data.eventListings.data.map(e => ({
            id: `ra_${e.id}`,
            title: e.title || "Festa Eletrônica",
            dateStart: e.date,
            city: e.city?.name || "Brasil",
            state: "BR",
            venue: e.venue?.name || "Local",
            artists: [],
            genres: ["Underground", "Techno"],
            priceMin: null,
            ticketStatus: "available",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop",
            ticketUrl: `https://ra.co/events/${e.id}`
        }));
    } catch (e) { return []; }
}

// ORQUESTRADOR
async function atualizarEventos() {
    console.log("🤖 MOTOR DE BUSCA (APIS LIVRES)...");
    const resultados = await Promise.all([fetchBandsintown(), fetchResidentAdvisor()]);
    let todos = resultados.flat();
    console.log(`📡 Resultados brutos: ${todos.length} eventos.`);

    if (todos.length === 0) {
        console.log("⚠️ Plano B...");
        todos = [{
            "id": "e001",
            "title": "Universo Paralello 2026/2027",
            "dateStart": "2026-12-27T16:00:00-03:00",
            "city": "Ituberá",
            "state": "BA",
            "venue": "Praia de Pratigi",
            "artists": ["Alok", "Astrix"],
            "genres": ["Psytrance"],
            "priceMin": 850.00,
            "ticketStatus": "available",
            "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
            "ticketUrl": "https://www.ingresse.com"
        }];
    }

    const pasta = path.join(process.cwd(), 'data');
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(path.join(pasta, 'demo-events.json'), JSON.stringify(todos, null, 4), 'utf8');
    console.log(`✅ Base atualizada com ${todos.length} eventos!`);
}

atualizarEventos();
