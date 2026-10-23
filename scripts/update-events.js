const fs = require('fs');
const path = require('path');

// 1. TICKETMASTER (API Oficial)
async function fetchTicketmaster() {
    console.log("🎟️ A procurar na Ticketmaster...");
    const token = process.env.TICKETMASTER_KEY;
    if (!token) return [];

    try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=Music&countryCode=BR&sort=date,asc&size=50&apikey=${token}`;
        const resposta = await fetch(url);
        if (!resposta.ok) return [];
        
        const dados = await resposta.json();
        if (!dados._embedded?.events) return [];

        return dados._embedded.events.map(evento => ({
            id: `tm_${evento.id}`,
            title: evento.name,
            dateStart: evento.dates?.start?.dateTime || evento.dates?.start?.localDate,
            city: evento._embedded?.venues?.[0]?.city?.name || "Brasil",
            state: evento._embedded?.venues?.[0]?.state?.stateCode || "BR",
            venue: evento._embedded?.venues?.[0]?.name || "Local a confirmar",
            artists: evento._embedded?.attractions ? evento._embedded.attractions.map(a => a.name) : [],
            genres: ["Eletrônica", "Festival"],
            priceMin: evento.priceRanges?.[0]?.min || null,
            ticketStatus: "available",
            image: evento.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600",
            ticketUrl: evento.url
        }));
    } catch (e) {
        console.error("Erro Ticketmaster:", e.message);
        return [];
    }
}

// 2. BANDSINTOWN (Agendas Oficiais de DJs)
async function fetchBandsintown() {
    console.log("🎧 A procurar agendas de DJs no Bandsintown...");
    const djs = [
        "Vintage Culture", "Alok", "Amelie Lens", "Astrix", 
        "Mochakk", "Boris Brejcha", "Charlotte de Witte", 
        "Peggy Gou", "Gabe", "Illusionize", "Victor Lou", "ANNA"
    ];
    let eventos = [];

    for (const dj of djs) {
        try {
            const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(dj)}/events?app_id=ravefinder_brasil`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const dados = await res.json();

            if (Array.isArray(dados)) {
                const eventosBr = dados.filter(e => e.venue?.country === "Brazil");
                eventos = eventos.concat(eventosBr.map(e => ({
                    id: `bit_${e.id}`,
                    title: `${dj} @ ${e.venue?.city || 'Brasil'}`,
                    dateStart: e.datetime,
                    city: e.venue?.city || "Brasil",
                    state: e.venue?.region || "BR",
                    venue: e.venue?.name || "Clube/Festival",
                    artists: [dj],
                    genres: ["Eletrônica"],
                    priceMin: null,
                    ticketStatus: "available",
                    image: "https://images.unsplash.com/photo-1540039155732-61ee4f308801?q=80&w=600&auto=format&fit=crop",
                    ticketUrl: e.url || "#"
                })));
            }
        } catch (e) {
            // Segue para o próximo DJ sem interromper
        }
    }
    return eventos;
}

// 3. CURADORIA DIRETA (Grandes Festivais do Brasil)
function getGrandesFestivais() {
    return [
        {
            "id": "cur_up",
            "title": "Universo Paralello Festival",
            "dateStart": "2026-12-27T16:00:00-03:00",
            "city": "Ituberá",
            "state": "BA",
            "venue": "Praia de Pratigi",
            "artists": ["Alok", "Astrix", "Vegas", "Swarup"],
            "genres": ["Psytrance", "Techno"],
            "priceMin": 850.00,
            "ticketStatus": "available",
            "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600",
            "ticketUrl": "https://www.ingresse.com"
        },
        {
            "id": "cur_tw",
            "title": "Time Warp Brasil",
            "dateStart": "2026-05-01T20:00:00-03:00",
            "city": "São Paulo",
            "state": "SP",
            "venue": "Vale do Anhangabaú",
            "artists": ["Charlotte de Witte", "Vintage Culture"],
            "genres": ["Techno", "Hard Techno"],
            "priceMin": 480.00,
            "ticketStatus": "available",
            "image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
            "ticketUrl": "https://www.ingresse.com"
        },
        {
            "id": "cur_xxx",
            "title": "XXXPERIENCE Festival",
            "dateStart": "2026-04-25T16:00:00-03:00",
            "city": "Itu",
            "state": "SP",
            "venue": "Arena Maeda",
            "artists": ["Astrix", "Skazi", "Vermont"],
            "genres": ["Psytrance", "Full-on"],
            "priceMin": 175.00,
            "ticketStatus": "available",
            "image": "https://images.unsplash.com/photo-1540039155732-61ee4f308801?q=80&w=600",
            "ticketUrl": "https://q2ingressos.com.br"
        }
    ];
}

// MOTOR PRINCIPAL
async function atualizarEventos() {
    console.log("🤖 INICIANDO BUSCA MULTICANAL...");

    const [tmEvents, bitEvents] = await Promise.all([
        fetchTicketmaster(),
        fetchBandsintown()
    ]);

    const curadoria = getGrandesFestivais();

    console.log(`🎟️ Ticketmaster: ${tmEvents.length} eventos`);
    console.log(`🎧 Bandsintown: ${bitEvents.length} eventos`);
    console.log(`⭐ Curadoria Nacional: ${curadoria.length} eventos`);

    // Junta tudo
    let todosEventos = [...curadoria, ...tmEvents, ...bitEvents];

    // Deduplicação básica por título
    const vistos = new Set();
    todosEventos = todosEventos.filter(ev => {
        const chave = ev.title.toLowerCase().trim();
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
    });

    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) fs.mkdirSync(pastaData, { recursive: true });

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(todosEventos, null, 4), 'utf8');
        
        console.log(`✅ Base de dados consolidada com ${todosEventos.length} eventos no total!`);
    } catch (erro) {
        console.error("❌ Erro ao salvar arquivo:", erro);
        process.exit(1);
    }
}

atualizarEventos();
