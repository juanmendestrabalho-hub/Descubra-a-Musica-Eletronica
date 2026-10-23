const fs = require('fs');
const path = require('path');

// ============================================================================
// ADAPTADOR 1: EVENTBRITE (Exemplo Funcional)
// ============================================================================
async function fetchEventbrite() {
    console.log("A procurar na Eventbrite...");
    
    // O Token é lido das variáveis de ambiente (Secrets do GitHub)
    const token = process.env.EVENTBRITE_TOKEN;
    if (!token) {
        console.warn(" EVENTBRITE_TOKEN não configurado. A ignorar esta fonte.");
        return [];
    }

    try {
      
        const url = 'https://www.eventbriteapi.com/v3/events/search/?q=techno+psytrance+rave&location.address=Brazil';
        
        const resposta = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resposta.ok) throw new Error(`Erro Eventbrite: ${resposta.status}`);
        
        const dados = await resposta.json();
        
        // Mapeia os dados da API original para o formato interno do Rave Finder
        return dados.events.map(evento => ({
            id: `eb_${evento.id}`,
            title: evento.name.text,
            dateStart: evento.start.utc,
            city: "Localização Padrão", // Eventbrite exige query extra para local
            state: "BR",
            venue: null,
            artists: [],
            genres: ["Eletrónica"],
            priceMin: null, // Eventbrite exige query extra para bilhetes
            ticketStatus: "available",
            image: evento.logo ? evento.logo.url : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
            ticketUrl: evento.url
        }));
    } catch (erro) {
        console.error("❌ Falha ao buscar na Eventbrite:", erro.message);
        return [];
    }
}

// ============================================================================
// ADAPTADOR 2: SYMPLA (Estrutura pronta para quando tiver a API Key)
// ============================================================================
async function fetchSympla() {
    console.log("A procurar na Sympla...");
    const token = process.env.SYMPLA_TOKEN;
    
    if (!token) {
        console.warn(" SYMPLA_TOKEN não configurado. A ignorar esta fonte.");
        return [];
    }

    try {
        // A API pública da Sympla usa o cabeçalho 's_token'
        const url = 'https://public-api.sympla.com.br/v3/events?category_id=4'; // 4 = Festas e Shows
        const resposta = await fetch(url, {
            headers: { 's_token': token }
        });
        
        if (!resposta.ok) throw new Error(`Erro Sympla: ${resposta.status}`);
        
        const dados = await resposta.json();
        
        return dados.data.map(evento => ({
            id: `sympla_${evento.id}`,
            title: evento.name,
            dateStart: evento.start_date,
            city: evento.location.city,
            state: evento.location.state,
            venue: evento.location.name,
            artists: [],
            genres: ["Eletrónica"],
            priceMin: null,
            ticketStatus: "available",
            image: evento.image || null,
            ticketUrl: evento.url
        }));
    } catch (erro) {
        console.error("❌ Falha ao buscar na Sympla:", erro.message);
        return [];
    }
}

// ============================================================================
// FUNÇÃO PRINCIPAL QUE ORQUESTRA TUDO
// ============================================================================
async function atualizarEventos() {
    console.log("🤖 A iniciar a recolha nacional de raves...");

    // Executa as procuras em paralelo (mais rápido)
    const eventosEventbrite = await fetchEventbrite();
    const eventosSympla = await fetchSympla();
    
    // Junta todos os eventos encontrados num único array
    let todosOsEventos = [...eventosEventbrite, ...eventosSympla];

    // Se as APIs falharem ou não estiverem configuradas, carrega os dados de emergência (para não deixar o site vazio)
    if (todosOsEventos.length === 0) {
        console.log(" Nenhuma API retornou dados. A manter eventos padrão.");
        return; // Sai do script para não apagar o JSON atual
    }

    try {
        const caminhoFicheiro = path.join(process.cwd(), 'data', 'demo-events.json');
        const conteudoJson = JSON.stringify(todosOsEventos, null, 4);
        fs.writeFileSync(caminhoFicheiro, conteudoJson, 'utf8');
        console.log(` Base de dados atualizada com ${todosOsEventos.length} eventos!`);
    } catch (erro) {
        console.error(" Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
