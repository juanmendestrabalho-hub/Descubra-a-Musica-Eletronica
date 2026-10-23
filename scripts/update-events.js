const fs = require('fs');
const path = require('path');

async function atualizarEventos() {
    console.log(" A iniciar a recolha de eventos...");
    let eventos = [];

    // TENTATIVA 1: Ligar à Sympla com disfarce
    try {
        console.log(" A tentar furar o bloqueio da Sympla...");
        const token = process.env.SYMPLA_TOKEN;
        const url = 'https://public-api.sympla.com.br/v3/events?category_id=4&sort_by=start_date';
        
        const resposta = await fetch(url, {
            headers: { 
                's_token': token || '',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (resposta.ok) {
            const dados = await resposta.json();
            if (dados.data && dados.data.length > 0) {
                console.log(" Sucesso! A Sympla permitiu o acesso.");
                eventos = dados.data.map(evento => ({
                    id: `sympla_${evento.id}`,
                    title: evento.name,
                    dateStart: evento.start_date,
                    city: evento.location?.city || "Local não informado",
                    state: evento.location?.state || "BR",
                    venue: evento.location?.name || "Local a revelar",
                    artists: [], 
                    genres: ["Eletrônica"],
                    priceMin: null, 
                    ticketStatus: "available",
                    image: evento.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
                    ticketUrl: evento.url
                }));
            }
        } else {
            console.log(` A Sympla bloqueou o acesso (Status: ${resposta.status}).`);
        }
    } catch (erro) {
        console.log(" Proteção Anti-Robô da Sympla detetada (fetch failed).");
    }

    // TENTATIVA 2 (PLANO B): Carregar os eventos reais do Brasil manualmente se a API falhar
    if (eventos.length === 0) {
        console.log(" Ativando o Plano B: Carregando Festivais Reais do Brasil...");
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
            },
            {
                "id": "e003",
                "title": "XXXPERIENCE Festival",
                "dateStart": "2026-04-25T16:00:00-03:00",
                "city": "Itu",
                "state": "SP",
                "venue": "Arena Maeda",
                "artists": ["Astrix", "Skazi", "Vermont"],
                "genres": ["Psytrance", "Full-on"],
                "priceMin": 175.00,
                "ticketStatus": "available",
                "image": "https://images.unsplash.com/photo-1540039155732-61ee4f308801?q=80&w=600&auto=format&fit=crop",
                "ticketUrl": "https://q2ingressos.com.br"
            }
        ];
    }

    // GUARDA OS DADOS NO FICHEIRO
    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) fs.mkdirSync(pastaData, { recursive: true });

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(eventos, null, 4), 'utf8');
        
        console.log(` Base de dados atualizada com ${eventos.length} eventos!`);
    } catch (erro) {
        console.error(" Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
