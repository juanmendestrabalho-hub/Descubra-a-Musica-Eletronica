const fs = require('fs');
const path = require('path');

async function fetchSympla() {
    console.log(" A procurar eventos na Sympla...");
    
    const token = process.env.SYMPLA_TOKEN;
    if (!token) {
        console.warn(" SYMPLA_TOKEN não configurado nas Secrets.");
        return [];
    }

    try {
        // Removemos o "&keyword=rave" para ele trazer festas reais sem filtro restrito
        const url = 'https://public-api.sympla.com.br/v3/events?category_id=4&sort_by=start_date';
        
        const resposta = await fetch(url, {
            headers: { 's_token': token }
        });
        
        if (!resposta.ok) {
            console.error(`Erro Sympla: ${resposta.status} - ${resposta.statusText}`);
            return [];
        }
        
        const dados = await resposta.json();
        
        if (!dados.data || dados.data.length === 0) {
            console.log("Nenhum evento retornado pela Sympla.");
            return [];
        }

        console.log(`Encontrados ${dados.data.length} eventos na Sympla!`);

        return dados.data.map(evento => ({
            id: `sympla_${evento.id}`,
            title: evento.name,
            dateStart: evento.start_date,
            city: evento.location && evento.location.city ? evento.location.city : "Local não informado",
            state: evento.location && evento.location.state ? evento.location.state : "BR",
            venue: evento.location && evento.location.name ? evento.location.name : "Local a revelar",
            artists: [], 
            genres: ["Eletrônica", "Festa"],
            priceMin: null, 
            ticketStatus: "available",
            image: evento.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
            ticketUrl: evento.url
        }));
    } catch (erro) {
        console.error(" Falha ao extrair dados da Sympla:", erro.message);
        return [];
    }
}

async function atualizarEventos() {
    console.log("🤖 A iniciar a recolha de eventos REAIS...");
    const eventosSympla = await fetchSympla();
    
    if (eventosSympla.length === 0) {
        console.log("⚠️ A API não devolveu eventos. O ficheiro atual não será apagado.");
        return; 
    }

    try {
        const pastaData = path.join(process.cwd(), 'data');
        if (!fs.existsSync(pastaData)) {
            fs.mkdirSync(pastaData, { recursive: true });
        }

        const caminhoFicheiro = path.join(pastaData, 'demo-events.json');
        const conteudoJson = JSON.stringify(eventosSympla, null, 4);
        
        fs.writeFileSync(caminhoFicheiro, conteudoJson, 'utf8');
        console.log(` SUCESSO: Site atualizado com ${eventosSympla.length} eventos reais da Sympla!`);
    } catch (erro) {
        console.error(" Erro ao guardar o ficheiro:", erro);
        process.exit(1);
    }
}

atualizarEventos();
