const API_KEY = "a3fda9b9d1d0aaee95df37313c16684e";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const detalhesContainer = document.getElementById("detalhesContainer");
const toggleTema = document.getElementById("toggleTema");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");

let isDarkMode = true;

// Toggle Tema Claro/Escuro
function carregarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo) {
        isDarkMode = temaSalvo === 'dark';
    }
    aplicarTema();
}

function aplicarTema() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        toggleTema.textContent = '☀️ Claro';
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        toggleTema.textContent = '🌙 Escuro';
    }
    localStorage.setItem('tema', isDarkMode ? 'dark' : 'light');
}

toggleTema.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    aplicarTema();
});

async function carregarDetalhes() {
    if (!id || !type){
        detalhesContainer.innerHTML = "<p>Conteúdo inválido.</p>";
        return;
    }
    try {
        const response = await fetch(
            `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=pt-BR`
        );
        if (!response.ok) { 
            throw new Error("Erro na API");
        }
        const data = await response.json();
        renderizarDetalhe(data, type);
    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
        detalhesContainer.innerHTML = "<p>Erro ao carregar informações.</p>";
    }
}

function renderizarDetalhe(data, tipo) {
    const poster = data.poster_path ? IMAGE_URL + data.poster_path : "assets/placeholder.jpg";
    const backdrop = data.backdrop_path ? IMAGE_URL + data.backdrop_path : poster;
    const titulo = data.title || data.name;
    const descricao = data.overview;
    const nota = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
    const lancamento = data.release_date || data.first_air_date || "Data desconhecida";
    const generos = data.genres ? data.genres.map(g => g.name).join(", ") : "Gênero desconhecido";
    
    detalhesContainer.innerHTML = `
        <div class="detalhes-background" style="background-image: url('${backdrop}')"></div>
        <div class="detalhes-conteudo">
            <img class="detalhes-poster" src="${poster}" alt="${titulo}">
            <div class="detalhes-info">
                <h1>${titulo}</h1>
                <div class="detalhes-meta">
                    <span class="nota">⭐ ${nota}/10</span>
                    <span class="lancamento">${lancamento}</span>
                    <span class="generos">${generos}</span>
                </div>
                <p class="descricao">${descricao}</p>
                <a href="../index.html" class="voltar-btn">← Voltar</a>
            </div>
        </div>
    `;
}

window.addEventListener("load", () => {
    carregarTema();
    carregarDetalhes();
});