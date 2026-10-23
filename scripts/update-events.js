const fs = require('fs');
const path = require('path');

// ============================================================================
// ADAPTADOR: SYMPLA
// ============================================================================
async function fetchSympla() {
    console.log("🔍 A procurar raves e festivais na Sympla...");
    
    // O Token é lido do cofre do GitHub (Secrets)
    const token = process.env.SYMPLA_TOKEN;
    
    if (!token) {
        console.warn("⚠️ SYMPLA_TOKEN não configurado. Adicione-o nos Secrets do GitHub!");
        return [];
    }

    try {
        // A API da Sympla: Procuramos na categoria 4 (Festas/Shows) por palavras-chave
        // O termo "rave" ou "psytrance" / "techno" ajuda a filtrar eventos genéricos
        const url = 'https://public-api.sympla.com.br/v3/events?category_id=4&keyword=rave&sort_by=start_date';
        
        const resposta = await fetch(url, {
            headers: { 's_token': token }
        });
        
        if (!resposta.ok) throw new Error(`Erro de comunicação com a Sympla: Status ${resposta.status}`);
        
        const dados = await resposta.json();
        
        if (!dados.data || dados.data.length === 0) {
            console.log("Nenhum evento encontrado com a palavra-chave atual.");
            return [];
        }

        // Mapeia os dados reais da Sympla para o formato que o nosso site usa
        return dados.data.map(evento => ({
            id: `sympla_${evento.id}`,
            title: evento.name,
            dateStart: evento.start_date,
            city: evento.location && evento.location.city ? evento.location.city : "Local não informado",
            state: evento.location && evento.location.state ? evento.location.state : "BR",
            venue: evento.location && evento.location.name ? evento.location.name : "Local a revelar",
            artists: [], // A Sympla não separa artistas, está tudo na descrição do evento
            genres: ["Eletrônica"],
            priceMin: null, // A API v3 da Sympla não envia preços na lista geral
            ticketStatus: "available",
            image: evento.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
            ticketUrl: evento.url
        }));
    } catch (erro) {
        console.error("❌ Falha ao extrair dados da Sympla:", erro.message);
        return [];
    }
}

// ============================================================================
// MOTOR PRINCIPAL
// ============================================================================
async function atualizarEventos() {
    console.log("🤖 A iniciar a recolha de eventos REAIS...");

    const eventosSympla = await fetchSympla();
    
    // Adiciona apenas os eventos da Sympla por agora (pode juntar outros depois)
    let todosOsEventos = [...eventosSympla];

    if (todosOsEventos.length === 0) {
        console.log("⚠️ Não foi possível obter novos eventos. A manter a base de dados atual.");
        return; 
    }

    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) {
            fs.mkdirSync(pastaData, { recursive: true });
        }

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        const conteudoJson = JSON.stringify(todosOsEventos, null, 4);
        
        fs.writeFileSync(caminhoFicheiro, conteudoJson, 'utf8');
        console.log(`✅ SUCESSO: Site atualizado com ${todosOsEventos.length} raves reais da Sympla!`);
    } catch (erro) {
        console.error("❌ Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
