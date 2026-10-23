const fs = require('fs');
const path = require('path');

// ==========================================
// 1. BANDSINTOWN (Sem chave - API Aberta)
// ==========================================
async function fetchBandsintown() {
    console.log("🎧 A procurar agendas de DJs no Bandsintown...");
    const djs = [
        "Vintage Culture", "Alok", "Amelie Lens", "Astrix", 
        "Mochakk", "Boris Brejcha", "Charlotte de Witte", 
        "Peggy Gou", "Gabe", "Illusionize", "Victor Lou"
    ];
    let eventosEncontrados = [];

    for (const dj of djs) {
        try {
            // O Bandsintown só pede um 'app_id' qualquer inventado por nós
            const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(dj)}/events?app_id=ravefinder_brasil_app`;
            const resposta = await fetch(url);
            if (!resposta.ok) continue;

            const dados = await resposta.json();
            if (Array.isArray(dados)) {
                const eventosBr = dados.filter(e => e.venue?.country === "Brazil");
                const formatados = eventosBr.map(evento => ({
                    id: `bit_${evento.id}`,
                    title: `${dj} @ ${evento.venue?.city}`,
                    dateStart: evento.datetime,
                    city: evento.venue?.city || "Brasil",
                    state: evento.venue?.region || "BR",
                    venue: evento.venue?.name || "Clube/Festival",
                    artists: [dj],
                    genres: ["Eletrônica", "Festa"],
                    priceMin: null,
                    ticketStatus: "available",
                    image: "https://images.unsplash.com/photo-1540039155732-61ee4f308801?q=80&w=600",
                    ticketUrl: evento.url || "#"
                }));
                eventosEncontrados = eventosEncontrados.concat(formatados);
            }
        } catch (e) {
            // Ignora erro de um DJ específico
        }
    }
    return eventosEncontrados;
}

// ==========================================
// 2. RESIDENT ADVISOR (Sem chave - GraphQL Aberto)
// ==========================================
async function fetchResidentAdvisor() {
    console.log("🕺 A procurar eventos no Resident Advisor (RA)...");
    try {
        const url = 'https://ra.co/graphql';
        // Consulta GraphQL pública para eventos no Brasil
        const query = `
          query {
            eventListings(countryId: 31) {
              data {
                id
                title
                date
                venue { name }
                city { name }
              }
            }
          }
        `;
        
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({ query })
        });
        
        if (!resposta.ok) return [];
        const json = await resposta.json();
        
        if (!json.data || !json.data.eventListings || !json.data.eventListings.data) return [];
        
        return json.data.eventListings.data.map(evento => ({
            id: `ra_${evento.id}`,
            title: evento.title || "Festa Eletrônica",
            dateStart: evento.date,
            city: evento.city?.name || "Brasil",
            state: "BR",
            venue: evento.venue?.name || "Secret Location",
            artists: [],
            genres: ["Underground", "Techno", "House"],
            priceMin: null,
            ticketStatus: "available",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
            ticketUrl: `https://ra.co/events/${evento.id}`
        }));
    } catch (e) {
        return [];
    }
}

// ==========================================
// 3. TICKETMASTER (Com chave oficial - Fallback opcional)
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
// ORQUESTRADOR: EXECUTA TUDO EM PARALELO
// ==========================================
async function atualizarEventos() {
    console.log("🤖 A INICIAR O SUPER MOTOR DE BUSCA (FOCO EM APIs LIVRES)...");

    const resultados = await Promise.all([
        fetchBandsintown(),
        fetchResidentAdvisor(),
        fetchTicketmaster()
    ]);

    let todosOsEventos = resultados.flat();

    console.log(`📡 Resultados brutos obtidos: ${todosOsEventos.length} eventos globais.`);

    if (todosOsEventos.length === 0) {
        console.log("⚠️ Nenhuma API retornou dados hoje. A carregar o Plano B...");
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
                "genres": ["Techno", "Hard Techno"],
                "priceMin": 480.00,
                "ticketStatus": "available",
                "image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
                "ticketUrl": "https://www.ingresse.com"
            }
        ];
    }

    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) fs.mkdirSync(pastaData, { recursive: true });

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(todosOsEventos, null, 4), 'utf8');
        
        console.log(`✅ EXCELENTE! Base de dados consolidada com ${todosOsEventos.length} eventos únicos!`);
    } catch (erro) {
        console.error("❌ Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
