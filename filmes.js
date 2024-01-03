import config from './config.js';

const mainElement = document.querySelector('.movie-container');

async function getPopularMovies() {
    try {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${config.apiKey}&language=en-US&page=1`;
        const fetchResponse = await fetch(url);
        const { results } = await fetchResponse.json();

        return results;
    }
    catch (error) {
        console.error('Erro ao buscar filmes populares:', error);
        return [];
    }
}

window.onload = async function () {
    clearMovieList();
    const movies = await getPopularMovies();
    movies.forEach(movie => renderizar_filme(movie));

    const inputElement = document.getElementById('busca_filme');
    const searchIcon = document.querySelector('.searchIcon');
    const checkbox = document.getElementById('filmes_favoritos');

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            // mostra apenas os filmes favoritos
            clearMovieList();
            const favoriteMovies = getFavoriteMovies();
            favoriteMovies.forEach(movie => renderizar_filme(movie));
        } else {
            //Mostra os filmes populares
            showPopularMovies();
        }
    });

    inputElement.addEventListener('keydown', async function (e) {
        // console.log(e);
        if (e.key === 'Enter') {
            const busca = inputElement.value;
            busca.trim();
            clearMovieList();
            if (busca !== '' && busca !== undefined && busca !== null) {
                const movies = await busca_filme(busca);
                movies.forEach(movie => renderizar_filme(movie));
            }
            else {
                const movies = await getPopularMovies()
                movies.forEach(movie => renderizar_filme(movie))
            }
        }
    });

    searchIcon.addEventListener('click', async function (e) {
        const busca = inputElement.value.trim();
        clearMovieList();
        if (busca !== '' && busca !== undefined && busca !== null) {
            const movies = await busca_filme(busca);
            movies.forEach(movie => renderizar_filme(movie));
        }
        else {
            const movies = await getPopularMovies()
            movies.forEach(movie => renderizar_filme(movie))
        }
    });
};

async function showPopularMovies() {
    clearMovieList();
    const movies = await getPopularMovies();
    movies.forEach(movie => renderizar_filme(movie));
}

async function busca_filme(busca) {
    try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${config.apiKey}&query=${busca}`;
        const fetchResponse = await fetch(url);
        const { results } = await fetchResponse.json();

        return results;
    }
    catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return [];
    }
}

function favoritar_filme(event, movie) {
    const checkFavoritos = {
        favoritado: 'icons/heart-fill.svg',
        naoFavoritado: 'icons/heart.svg'
    }

    if (event.target.src.includes(checkFavoritos.naoFavoritado)) {
        // aqui ele será favoritado
        event.target.src = checkFavoritos.favoritado;
        saveToLocalStorage(movie);
    }
    else {
        // aqui ele será desfavoritado
        event.target.src = checkFavoritos.naoFavoritado;
        removeFromLocalStorage(movie.id);
    }
}

// E pra buscar no Local Storage:
function getFavoriteMovies() {
    return JSON.parse(localStorage.getItem('favoriteMovies'))
}

function saveToLocalStorage(movie) {
    const movies = getFavoriteMovies() || []; // busca os filmes favoritados no Local Storage

    movies.push(movie) // inclui o novo filme favorito no array
    console.log(movies);
    const moviesJSON = JSON.stringify(movies);
    localStorage.setItem('favoriteMovies', moviesJSON) // salva o array no Local Storage
}

function checkMovieIsFavorited(id) {
    const movies = getFavoriteMovies() || [];
    return movies.find(movie => movie.id == id)
}

function removeFromLocalStorage(id) {
    const movies = getFavoriteMovies() || []; // busca os filmes favoritados no Local Storage

    const findMovie = movies.find(movie => movie.id == id);
    const newMovies = movies.filter(movie => movie.id != findMovie.id);
    localStorage.setItem('favoriteMovies', JSON.stringify(newMovies)); // salva o array no Local Storage
}


function clearMovieList() {
    mainElement.innerHTML = '';
}

function renderizar_filme(movie) {
    const { id, title, poster_path, vote_average, release_date, overview } = movie;
    const isFavorited = checkMovieIsFavorited(id);
    const image = `https://image.tmdb.org/t/p/w500${poster_path}`;

    //cria a div do card do filme
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie-card');
    mainElement.appendChild(movieElement);

    // cria a div de info do filme
    const movieInfo = document.createElement('div');
    movieInfo.classList.add('movie-info');
    movieElement.appendChild(movieInfo);

    // cria a div da imagem do filme
    const movieImg = document.createElement('div');
    movieImg.classList.add('movie-image');
    movieInfo.appendChild(movieImg);

    // cria a div do titulo do filme
    const movieTitle = document.createElement('div');
    movieTitle.classList.add('movie-title');
    movieInfo.appendChild(movieTitle);

    // carrega o conteudo do titulo
    const data_full = new Date(release_date);
    const ano = data_full.getFullYear();
    const titleContent = document.createElement('h4');
    titleContent.textContent = title + ' (' + ano + ')';
    movieTitle.appendChild(titleContent);

    // Cria as divs de favoritar
    const ratingFavorites = document.createElement('div');
    ratingFavorites.classList.add('rating-favorites');
    movieTitle.appendChild(ratingFavorites);

    // rating
    const ratingElement = document.createElement('div');
    ratingElement.classList.add('rating');
    ratingFavorites.appendChild(ratingElement);

    const ratingImg = document.createElement('img');
    const ratingSpan = document.createElement('span');
    ratingImg.src = '/icons/star.svg';
    ratingImg.alt = 'Star Icon';
    ratingSpan.textContent = vote_average.toFixed(1);
    ratingElement.appendChild(ratingImg);
    ratingElement.appendChild(ratingSpan);

    // favoritar
    const favoriteElement = document.createElement('div');
    favoriteElement.classList.add('favorite');
    ratingFavorites.appendChild(favoriteElement);

    const favoriteImg = document.createElement('img');
    const favoriteSpan = document.createElement('span');
    favoriteImg.src = isFavorited ? 'icons/heart-fill.svg' : 'icons/heart.svg';
    favoriteImg.alt = 'Heart Icon';
    favoriteImg.addEventListener('click', (event) => favoritar_filme(event, movie));
    favoriteSpan.classList.add('favorite-movie');
    favoriteSpan.textContent = 'Favoritar';
    favoriteElement.appendChild(favoriteImg);
    favoriteElement.appendChild(favoriteSpan);

    // cria a div de descrição do filme
    const movieDescription = document.createElement('div');
    movieDescription.classList.add('movie-description');
    movieInfo.appendChild(movieDescription);

    // carrega o conteudo da imagem
    const imageContent = document.createElement('img');
    imageContent.src = `${movie.image}`;
    imageContent.src = image;
    imageContent.alt = movie.title;
    movieImg.appendChild(imageContent);


    // carrega o conteudo da descricao
    const descriptionContent = document.createElement('span');
    descriptionContent.textContent = overview;
    movieDescription.appendChild(descriptionContent);
}