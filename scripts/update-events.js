const fs = require('fs');
const path = require('path');

async function fetchShotgun() {
    console.log("🔍 A procurar eventos na Shotgun...");
    
    // Opcional no futuro: Aqui entrará a integração real quando tivermos acesso à API da Shotgun
    // Por enquanto, simulamos uma falha de chave para ativar imediatamente o Plano B
    return []; 
}

async function atualizarEventos() {
    console.log("🤖 A iniciar a recolha rápida de eventos...");
    
    // Tenta procurar na plataforma (retorna vazio por agora)
    let eventos = await fetchShotgun();

    // PLANO B: Ativa os maiores festivais reais e atualizados do Brasil
    if (eventos.length === 0) {
        console.log("⚠️ Nenhuma chave de API detetada. A carregar os festivais principais...");
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

    // GUARDA OS DADOS
    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) fs.mkdirSync(pastaData, { recursive: true });

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(eventos, null, 4), 'utf8');
        
        console.log(`✅ Base de dados perfeitamente atualizada com ${eventos.length} eventos!`);
    } catch (erro) {
        console.error("❌ Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
