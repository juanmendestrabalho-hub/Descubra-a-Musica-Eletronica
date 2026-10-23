const fs = require('fs');
const path = require('path');

async function fetchShotgun() {
    console.log("🔍 A tentar o truque de extração da Shotgun (Brasil)...");
    
    // A API interna da Shotgun costuma usar a plataforma GraphQL para as pesquisas do frontend
    const url = 'https://api.shotgun.live/graphql';
    
    // Esta é a query real que o site deles envia quando você procura festas
    const query = `
      query SearchEvents($filter: EventFilterInput!) {
        searchEvents(filter: $filter) {
          edges {
            node {
              id
              name
              startTime
              endTime
              location {
                city
                region
                name
              }
              cover {
                url
              }
              minPrice
              url
              genres {
                name
              }
            }
          }
        }
      }
    `;

    // Filtramos para o país Brasil (BR) e eventos a partir de hoje
    const variables = {
        filter: {
            country: "BR",
            minStartTime: new Date().toISOString()
        }
    };

    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Simulamos que o pedido vem do site deles
                'Origin': 'https://shotgun.live',
                'Referer': 'https://shotgun.live/'
            },
            body: JSON.stringify({ query, variables })
        });
        
        if (!resposta.ok) {
            console.error(`Erro Shotgun: ${resposta.status}`);
            return [];
        }
        
        const json = await resposta.json();
        
        if (!json.data || !json.data.searchEvents || !json.data.searchEvents.edges.length) {
            console.log("Nenhum evento retornado pela Shotgun.");
            return [];
        }

        const eventosExtraidos = json.data.searchEvents.edges;
        console.log(`Encontrados ${eventosExtraidos.length} eventos na Shotgun!`);

        return eventosExtraidos.map(edge => {
            const evento = edge.node;
            return {
                id: `shotgun_${evento.id}`,
                title: evento.name,
                dateStart: evento.startTime,
                city: evento.location?.city || "Local não informado",
                state: evento.location?.region || "BR",
                venue: evento.location?.name || "A anunciar",
                artists: [], // A Shotgun guarda os artistas noutra query mais profunda
                genres: evento.genres ? evento.genres.map(g => g.name) : ["Eletrônica"],
                priceMin: evento.minPrice ? (evento.minPrice / 100) : null, // A Shotgun envia em cêntimos
                ticketStatus: "available",
                image: evento.cover?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
                ticketUrl: evento.url || "https://shotgun.live"
            };
        });
    } catch (erro) {
        console.error("❌ Falha na extração da Shotgun:", erro.message);
        return [];
    }
}

async function atualizarEventos() {
    console.log("🤖 A iniciar a recolha de eventos...");
    
    let eventos = await fetchShotgun();

    // PLANO B (Fallback)
    if (eventos.length === 0) {
        console.log("⚠️ A extração falhou. A carregar o Plano B (Festivais Oficiais)...");
        eventos = [
            {
                "id": "e001",
                "title": "Universo Paralello 2026/2027",
                "dateStart": "2026-12-27T16:00:00-03:00",
                "city": "Ituberá",
                "state": "BA",
                "venue": "Praia de Pratigi",
                "artists": ["Alok", "Astrix", "Vegas", "Swarup"],
                "genres": ["Psytrance", "Techno", "House"],
                "priceMin": 850.00,
                "ticketStatus": "available",
                "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
                "ticketUrl": "https://www.ingresse.com/universo-paralello-2027/"
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
                "image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop",
                "ticketUrl": "https://www.ingresse.com"
            }
        ];
    }

    // GUARDA OS DADOS
    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) fs.mkdirSync(pastaData, { recursive: true });

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(eventos, null, 4), 'utf8');
        
        console.log(`✅ Base de dados atualizada com ${eventos.length} eventos!`);
    } catch (erro) {
        console.error("❌ Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
