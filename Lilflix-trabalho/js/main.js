const API_KEY = "a3fda9b9d1d0aaee95df37313c16684e";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const campoPesquisa = document.getElementById('campoPesquisa');
const botaoPesquisa = document.getElementById('botaoPesquisa');
const filmesGrid = document.getElementById('filmesGrid');
const inicio = document.getElementById('inicio');
const filmes = document.getElementById('filmes');
const series = document.getElementById('series');
const filtroGenero = document.getElementById('filtroGenero');
const filtroAno = document.getElementById('filtroAno');
const filtroNota = document.getElementById('filtroNota');
const filtroPais = document.getElementById('filtroPais');
const toggleTema = document.getElementById('toggleTema');
const loader = document.getElementById('loader');
const logo = document.getElementById('logo');

let todasAsFilmes = [];
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

logo.addEventListener('click', () => {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2026`;
    requisicaoURL(url, false);
});

// Carregar Gêneros
async function carregarGeneros() {
    try {
        const response = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`
        );
        const data = await response.json();
        data.genres.forEach(genero => {
            const option = document.createElement('option');
            option.value = genero.id;
            option.textContent = genero.name;
            filtroGenero.appendChild(option);
        });
    } catch (erro) {
        console.error("Erro ao carregar gêneros:", erro);
    }
}

// Carregar Anos
function carregarAnos() {
    const anoAtual = new Date().getFullYear();
    for (let ano = anoAtual; ano >= 1950; ano--) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
    }
}

// carregarTodas controla se devem ser buscadas todas as páginas ou apenas a primeira
async function requisicaoURL(url, carregarTodas = true) {
    try {
        if (loader) loader.classList.add('ativo');

        todasAsFilmes = [];

        // se não queremos todas as páginas, basta fazer uma única requisição
        if (!carregarTodas) {
            const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}page=1`);
            if (!response.ok) throw new Error("Erro na requisição:");
            const data = await response.json();
            todasAsFilmes = data.results || [];
            renderizarMidia(todasAsFilmes);
            return;
        }

        // para carregar tudo, iteramos por todas as páginas
        let page = 1;
        let totalPages = 1;

        do {
            const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}page=${page}`);
            if (!response.ok) {
                throw new Error("Erro na requisição:");
            }
            const data = await response.json();
            todasAsFilmes.push(...(data.results || []));
            totalPages = data.total_pages || 1;
            page++;
        } while (page <= totalPages);

        renderizarMidia(todasAsFilmes);
    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
    } finally {
        if (loader) loader.classList.remove('ativo');
    }
}

function renderizarMidia(dados) {
    filmesGrid.innerHTML = "";
    
    if (!dados || dados.length === 0) {
        filmesGrid.innerHTML = "<p>Nenhum resultado encontrado</p>";
        return;
    }

    dados.forEach(item => {
        if (item.poster_path) {
            const poster = IMAGE_URL + item.poster_path;
            const titulo = item.title || item.name;
            const id = item.id;
            const tipo = item.title ? "movie" : "tv";

            const card = document.createElement("div");
            card.classList.add("filme-card");
            card.innerHTML = `
                <img src="${poster}" alt="${titulo}">
                <h3>${titulo}</h3>
            `;
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                window.location.href = `./detalhes/index.html?id=${id}&type=${tipo}`;
            });

            filmesGrid.appendChild(card);
        }
    });
}

// os filtros agora fazem requisições à API com os valores selecionados
function aplicarFiltros() {
    // endpoint básico para filmes públicos; começa com 2026 por padrão
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc`;

    // se o usuário escolheu um ano, usamos esse ano; caso contrário não filtramos por ano
    const ano = filtroAno.value;
    if (ano) {
        url += `&primary_release_year=${ano}`;
    }

    if (filtroGenero.value) {
        url += `&with_genres=${filtroGenero.value}`;
    }
    if (filtroNota.value) {
        url += `&vote_average.gte=${filtroNota.value}`;
    }
    if (filtroPais.value) {
        // usar parâmetro de país de origem para manter os filmes de outras línguas
        url += `&with_origin_country=${filtroPais.value}`;
    }

    // sempre trazer apenas primeira página nos filtros para manter a velocidade
    requisicaoURL(url, false);
}

// event listeners para filtros agora acionam aplicarFiltros
function filtrarPorGenero() { aplicarFiltros(); }
function filtrarPorAno() { aplicarFiltros(); }
function filtrarPorNota() { aplicarFiltros(); }
function filtrarPorPais() { aplicarFiltros(); }

botaoPesquisa.addEventListener("click", () => {
    const query = campoPesquisa.value.trim();
    if (query) {
        const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}&language=pt-BR`;
        requisicaoURL(url);
    }
});

campoPesquisa.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        botaoPesquisa.click();
    }
});

filtroGenero.addEventListener("change", filtrarPorGenero);
filtroAno.addEventListener("change", filtrarPorAno);
filtroNota.addEventListener("change", filtrarPorNota);
filtroPais.addEventListener("change", filtrarPorPais);

inicio.addEventListener("click", (e) => {
    e.preventDefault();
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2026`;
    requisicaoURL(url, false); // primeira página só
});

filmes.addEventListener("click", (e) => {
    e.preventDefault();
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc`;
    requisicaoURL(url, false); // apenas primeira página para não carregar tantos itens
});

series.addEventListener("click", (e) => {
    e.preventDefault();
    const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc`;
    requisicaoURL(url, false); // limitar a primeira página de séries populares
});

// Inicializar ao carregar a página
window.addEventListener("load", () => {
    carregarTema();
    carregarGeneros();
    carregarAnos();
    // página inicial: apenas primeira página de 2026 para não pesar o site
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2026`;
    requisicaoURL(url, false);
});