const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer'); // A nova ferramenta fantasma!

async function atualizarEventos() {
    console.log(" A iniciar a recolha de eventos...");
    let eventos = [];

    // TENTATIVA 1: O NAVEGADOR FANTASMA
    let browser;
    try {
        console.log(" A iniciar o Google Chrome invisível...");
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log("🌐 A aceder à página principal da Sympla para furar o bloqueio...");
        // Vamos à página inicial da Sympla como um humano normal para ganhar cookies válidos
        await page.goto('https://www.sympla.com.br', { waitUntil: 'networkidle2' });
        
        console.log("💉 A injetar código dentro do navegador para puxar a API...");
        const token = process.env.SYMPLA_TOKEN || '';
        
        // Tudo o que está dentro do page.evaluate corre DENTRO do Chrome invisível!
        eventos = await page.evaluate(async (sToken) => {
            const url = 'https://public-api.sympla.com.br/v3/events?category_id=4&sort_by=start_date';
            const response = await fetch(url, {
                headers: { 
                    's_token': sToken,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) return null;
            
            const json = await response.json();
            if (!json.data) return [];
            
            return json.data.map(evento => ({
                id: `sympla_${evento.id}`,
                title: evento.name,
                dateStart: evento.start_date,
                city: evento.location?.city || "Local não informado",
                state: evento.location?.state || "BR",
                venue: evento.location?.name || "Local a revelar",
                artists: [], 
                genres: ["Eletrônica", "Festa"],
                priceMin: null, 
                ticketStatus: "available",
                image: evento.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
                ticketUrl: evento.url
            }));
        }, token);

        await browser.close();

        if (eventos && eventos.length > 0) {
            console.log(` Sucesso Absoluto! O Navegador Fantasma roubou ${eventos.length} eventos reais da Sympla!`);
        } else {
            console.log(" A chave da Sympla não tem permissões suficientes ou a API bloqueou a injeção.");
            eventos = [];
        }

    } catch (erro) {
        console.error(" O Navegador Fantasma falhou:", erro.message);
        if (browser) await browser.close();
    }

    // TENTATIVA 2 (PLANO B DE EMERGÊNCIA)
    if (!eventos || eventos.length === 0) {
        console.log(" Ativando o Plano B: Carregando Festivais Reais do Brasil (Manual)...");
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

    // GUARDA OS DADOS NO FICHEIRO
    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) fs.mkdirSync(pastaData, { recursive: true });

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        fs.writeFileSync(caminhoFicheiro, JSON.stringify(eventos, null, 4), 'utf8');
        
        console.log(` Processo terminado. Base de dados atualizada!`);
    } catch (erro) {
        console.error(" Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
