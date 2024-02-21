import { global } from './globals.js';
import { posterPath, displayBackgroundImage } from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { formatDate, currencyFormatter } from './formatters.js';

console.log(global.currentPage);

// Display the 20 most popular movies
export async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular'); // curly braces around the results deconstructs it to get just the array
  //   console.log(results);

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

// Display Movie Details
export async function displayMovieDetails() {
  const movieID = window.location.search.split('=')[1];
  //   console.log(movieID);

  const movie = await fetchAPIData(`movie/${movieID}`);
  console.log(movie);

  //Traversy's solution for genres text: ${movie.genre.map((genre) => `<li>${genre.name}</li>`).join('')}
  const genreList = document.createElement('ul');
  genreList.classList.add('list-group');
  movie.genres.forEach((genre) => {
    const li = document.createElement('li');
    li.textContent = genre.name;
    genreList.appendChild(li);
  });

  //Traversy's solution for companies text: ${movie.production_companies.map((company) => `<span>${company.name}</span>`).join('')}
  const companies = movie.production_companies;
  let productionCompanyString = '';
  companies.forEach((company) => {
    productionCompanyString += company.name;
    if (company !== companies[companies.length - 1]) {
      productionCompanyString += '; ';
    }
  });

  displayBackgroundImage(movie.backdrop_path);

  const div = document.createElement('div');
  //   const rating = Math.round(movie.vote_average);
  const rating = movie.vote_average.toFixed(1);

  div.innerHTML = `<div class="details-top">
  <div>
    ${posterPath(movie)}
  </div>
  <div>
    <h2>${movie.title}</h2>
    <h5>${movie.tagline}</h5>
    <p>
      <i class="fas fa-star text-primary"></i>
      ${rating} / 10
    </p>
    <p class="text-muted">Release Date: ${formatDate(movie.release_date)}</p>
    <p>
      ${movie.overview}
    </p>
    <h4>Genres</h4>
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
