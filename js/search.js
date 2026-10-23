export function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { func.apply(null, args); }, delay);
    };
}

export function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function setupSearch(onSearchChange) {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    const handleSearch = debounce((e) => {
        const term = e.target.value.trim();
        clearBtn.style.display = term.length > 0 ? 'block' : 'none';
        onSearchChange(removeAccents(term));
    });

    input.addEventListener('input', handleSearch);

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        onSearchChange('');
        input.focus();
    });
}
