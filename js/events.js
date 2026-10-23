export function renderEvents(events) {
    const grid = document.getElementById('eventsGrid');
    const resultCount = document.getElementById('resultCount');

    if (events.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#888;">
            <p>Nenhum evento encontrado para os filtros selecionados.</p>
        </div>`;
        resultCount.textContent = "Nenhum evento encontrado.";
        return;
    }

    resultCount.textContent = `${events.length} evento(s) encontrado(s).`;

    grid.innerHTML = events.map(event => {
        const dateStr = event.dateStart ? event.dateStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Data a confirmar';
        const priceStr = event.priceMin !== null ? `A partir de R$ ${event.priceMin.toFixed(2)}` : 'Preço não informado';
        
        const genreTags = event.genres.map(g => `<span class="tag genre">${g}</span>`).join('');
        const stateTag = `<span class="tag">${event.state}</span>`;

        return `
            <article class="event-card">
                <div class="event-image" style="background-image: url('${event.image}')"></div>
                <div class="event-content">
                    <div class="event-tags">
                        ${stateTag} ${genreTags}
                    </div>
                    <h2 class="event-title">${event.title}</h2>
                    <p class="event-info">📅 ${dateStr}</p>
                    <p class="event-info">📍 ${event.city} - ${event.state} ${event.venue ? `(${event.venue})` : ''}</p>
                    ${event.artists.length > 0 ? `<p class="event-info">🎧 ${event.artists.slice(0,2).join(', ')}${event.artists.length > 2 ? ' + mais' : ''}</p>` : ''}
                    
                    <div class="event-price">
                        <span>${priceStr}</span>
                        ${event.ticketStatus === 'available' ? 
                            `<a href="${event.ticketUrl}" target="_blank" class="btn-buy" rel="noopener noreferrer">Ingressos</a>` : 
                            `<span style="color:var(--text-muted); font-size:0.8rem;">Esgotado / Indisponível</span>`}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}
