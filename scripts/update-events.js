const fs = require('fs');
const path = require('path');

// 1. TICKETMASTER (API Oficial Gratuita)
async function fetchTicketmaster() {
    console.log("🎟️ A procurar na Ticketmaster (API Oficial)...");
    const token = process.env.TICKETMASTER_KEY;
    if (!token) {
        console.log("⚠️ TICKETMASTER_KEY não configurada nas Secrets.");
        return [];
    }

    try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=Music&countryCode=BR&sort=date,asc&apikey=${token}`;
        const resposta = await fetch(url);
        if (!resposta.ok) {
            console.log(`Erro Ticketmaster: ${resposta.status}`);
            return [];
        }
        
        const dados = await resposta.json();
        if (!dados._embedded || !dados._embedded.events) {
            console.log("Nenhum evento encontrado na Ticketmaster.");
            return [];
        }

        console.log(`✅ ${dados._embedded.events.length} eventos obtidos na Ticketmaster!`);

        return dados._embedded.events.map(evento => ({
            id: `tm_${evento.id}`,
            title: evento.name,
            dateStart: evento.dates?.start?.dateTime || evento.dates?.start?.localDate,
            city: evento._embedded?.venues?.[0]?.city?.name || "Brasil",
            state: evento._embedded?.venues?.[0]?.state?.stateCode || "BR",
            venue: evento._embedded?.venues?.[0]?.name || "Local a confirmar",
            artists: evento._embedded?.attractions ? evento._embedded.attractions.map(a => a.name) : [],
            genres: ["Eletrônica", "Show"],
            priceMin: evento.priceRanges?.[0]?.min || null,
            ticketStatus: "available",
            image: evento.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600",
            ticketUrl: evento.url
        }));
    } catch (e) {
        console.error("❌ Falha na API Ticketmaster:", e.message);
        return [];
    }
}

// ORQUESTRADOR
async function atualizarEventos() {
    console.log("🤖 MOTOR DE BUSCA EM EXECUÇÃO...");
    
    let eventos = await fetchTicketmaster();

    // Plano B para manter o site populado caso a API falhe ou não tenha dados no momento
    if (eventos.length === 0) {
        console.log("⚠️ Ativando Plano B (Festivais Nacionais)...");
        eventos = [
            {
                "id": "e001",
                "title": "Universo Paralello 2026/2027",
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
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(eventos, null, 4), 'utf8');
        
        console.log(`✅ Base de dados atualizada com sucesso (${eventos.length} eventos)!`);
    } catch (erro) {
        console.error("❌ Erro ao salvar arquivo:", erro);
        process.exit(1);
    }
}

atualizarEventos();
