const global = {
  currentPage: window.location.pathname,
};

console.log(global.currentPage);

//
async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular'); // curly braces around the results deconstructs it to get just the array
  console.log(results);
  const noImage = `<img
      src="images/no-image.jpg"
      class="card-img-top"
      alt="Movie Title"
      />`;

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');
    const posterPath = movie.poster_path
      ? `<img
        src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
        class="card-img-top"
        alt="${movie.title}"
        />`
      : noImage;
    div.innerHTML = ` 
        <a href="movie-details.html?id=${movie.id}">
            ${posterPath}
        </a>
        <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <p class="card-text">
            <small class="text-muted">Release: ${movie.release_date}</small>
        </p>
        </div> `;

    document.querySelector('#popular-movies').appendChild(div);
  });
}

// Fetch data from TMDB API
async function fetchAPIData(endpoint) {
  const API_KEY = '0588b79e9e6f5bcfa157f943d262c18c'; // if it's a production application, don't do this; use a backend server to store this key, make the request to the API from your server. Normallly, you'd have it in a .ENV file on your local server
  const API_URL = 'https://api.themoviedb.org/3/';

  const options = {
    // how themoviedb.org says to do it
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: '0588b79e9e6f5bcfa157f943d262c18c',
    },
  };

  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US` //,
    // options
  );

  const data = await response.json();

  return data;
}

// Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link'); // all with class of nav-link
  links.forEach((link) => {
    if (link.getAttribute('href') == global.currentPage) {
      link.classList.add('active');
    }
  });
}

// Init App - runs on every page
function init() {
  switch (
    global.currentPage // Simple router
  ) {
    case '/':
    case '/index.html':
      //   console.log('Home');
      displayPopularMovies();
      break;
    case '/shows.html':
      console.log('Shows');
      break;
    case '/movie-details.html':
      console.log('Movie Details');
      break;
    case '/tv-details.html':
      console.log('TV Details');
      break;
    case '/search.html':
      console.log('Search');
      break;
  }
  highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);
