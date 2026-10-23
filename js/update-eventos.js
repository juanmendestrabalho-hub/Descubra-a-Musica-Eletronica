const fs = require('fs');
const path = require('path');

async function fetchEventosLivres() {
    console.log("A procurar em bases de dados abertas...");
    try {
        const url = 'https://jsonplaceholder.typicode.com/posts?_limit=4';
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        return dados.map((item, index) => ({
            id: `test_${item.id}`,
            title: ` FESTIVAL AUTOMÁTICO 2026 - Lote ${index + 1}`,
            dateStart: new Date(Date.now() + (index + 10) * 86400000).toISOString(),
            city: "São Paulo",
            state: "SP",
            venue: "Arena Open Air",
            artists: ["Astrix", "Vegas", "Vintage Culture"],
            genres: ["Psytrance", "Techno"],
            priceMin: 120.00 + (index * 20),
            ticketStatus: "available",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
            ticketUrl: "#"
        }));
    } catch (erro) {
        console.error(" Falha na API aberta:", erro.message);
        return [];
    }
}

async function atualizarEventos() {
    console.log(" A iniciar a recolha de testes...");
    const novosEventos = await fetchEventosLivres();

    if (novosEventos.length === 0) {
        console.log(" Nenhuma API retornou dados.");
        return; 
    }

    try {
 
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) {
            fs.mkdirSync(pastaData, { recursive: true });
        }

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        const conteudoJson = JSON.stringify(novosEventos, null, 4);
        
        fs.writeFileSync(caminhoFicheiro, conteudoJson, 'utf8');
        console.log(` Base de dados atualizada com ${novosEventos.length} novos eventos de teste!`);
    } catch (erro) {
        console.error(" Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
