const global = {
  currentPage: window.location.pathname,
};

console.log(global.currentPage);

function noImage() {
  return `<img
    src="../images/no-image.jpg"
    class="card-img-top"
    alt="Movie Title"
    />`;
}

function posterPath(media, isTV = false) {
  const alt = isTV ? media.name : media.title;
  return media.poster_path //'w500' means width of 500
    ? `<img
      src="https://image.tmdb.org/t/p/w500${media.poster_path}"
      class="card-img-top"
      alt="${alt}"
      />`
    : noImage();
}

// Display the 20 most popular movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular'); // curly braces around the results deconstructs it to get just the array
  console.log(results);

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');

    div.innerHTML = ` 
        <a href="movie-details.html?id=${movie.id}">${posterPath(movie)}
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

// Display the 20 most popular tv shows
async function displayPopularTVShows() {
  const { results } = await fetchAPIData('tv/popular');
  console.log(results);

  results.forEach((tvShow) => {
    const div = document.createElement('div');
    div.classList.add('card');

    div.innerHTML = ` 
        <a href="tv-details.html?id=${tvShow.id}">${posterPath(tvShow, true)}
        </a>
        <div class="card-body">
        <h5 class="card-title">${tvShow.name}</h5>
        <p class="card-text">
            <small class="text-muted">Aired: ${tvShow.first_air_date}</small>
        </p>
        </div> `;

    document.querySelector('#popular-shows').appendChild(div);
  });
}

// Create  number formatter
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

// console.log(formatter.format(2500)); /* $2,500.00 */

// Display Movie Details
async function displayMovieDetails() {
  const movieID = window.location.search.split('=')[1];
  //   console.log(movieID);

  const movie = await fetchAPIData(`movie/${movieID}`);
  console.log(movie);

  const genreList = document.createElement('ul');
  genreList.classList.add('list-group');
  movie.genres.forEach((genre) => {
    li = document.createElement('li');
    li.textContent = genre.name;
    genreList.appendChild(li);
  });

  //Traversy's solution for genres text: ${movie.genre.map((genre) => `<li>${genre.name}</li>`).join('')}

  const companies = movie.production_companies;
  let productionCompanyString = '';
  companies.forEach((company) => {
    productionCompanyString += company.name;
    if (company !== companies[companies.length - 1]) {
      productionCompanyString += '; ';
    }
  });

  //Traversy's solution for companies text: ${movie.production_companies.map((company) => `<span>${company.name}</span>`).join('')}

  const div = document.createElement('div');
  //   const rating = Math.round(movie.vote_average);
  const rating = movie.vote_average.toFixed(1);

  div.innerHTML = `<div class="details-top">
  <div>
    ${posterPath(movie)}
  </div>
  <div>
    <h2>${movie.title}</h2>
    <p>
      <i class="fas fa-star text-primary"></i>
      ${rating} / 10
    </p>
    <p class="text-muted">Release Date: ${movie.release_date}</p>
    <p>
      ${movie.overview}
    </p>
    <h5>Genres</h5>
    ${genreList.innerHTML}
    <a href="${
      movie.homepage
    }" target="_blank" class="btn">Visit Movie Homepage</a>
  </div>
</div>
<div class="details-bottom">
  <h2>Movie Info</h2>
  <ul>
    <li><span class="text-secondary">Budget:</span> ${currencyFormatter.format(
      movie.budget
    )}</li>
    <li><span class="text-secondary">Revenue:</span> ${currencyFormatter.format(
      movie.revenue
    )}</li>
    <li><span class="text-secondary">Runtime:</span> ${
      movie.runtime
    } minutes</li>
    <li><span class="text-secondary">Status:</span> ${movie.status}</li>
  </ul>
  <h4>Production Companies</h4>
  <div class="list-group">${productionCompanyString}</div>
</div>`;
  document.querySelector('#movie-details').appendChild(div);
}

// Fetch data from TMDB API
async function fetchAPIData(endpoint) {
  // Registor your key at https://www.themoviedb.org/settings/api and enter here
  // Only use this for development or very small projects you should store your key an dmake requests from a server
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

  showSpinner();
  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US` //,
    // options
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
  document.querySelector('.spinner').classList.remove('show');
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
      displayPopularTVShows();
      break;
    case '/movie-details.html':
      console.log('Movie Details');
      displayMovieDetails();
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
