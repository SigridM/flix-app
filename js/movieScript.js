import { global } from './globals.js';
import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { formatDate, currencyFormatter } from './formatters.js';
import {
  addRatingIcon,
  cardBodyDiv,
  spanFor,
  genreList,
  mediaProviders,
} from './commonElements.js';

// Display the 20 most popular movies
export async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular'); // curly braces around the results deconstructs it to get just the array

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');

    const anchor = document.createElement('a');
    anchor.href = 'movie-details.html?id=' + movie.id;
    anchor.appendChild(posterPathImageLink(movie));
    div.appendChild(anchor);

    div.appendChild(cardBodyDiv(movie));

    document.querySelector('#popular-movies').appendChild(div);
  });
}

// Create and return the div that is in the top portion of the window
// containing the movie poster image and other details
function detailsTop(movie) {
  const div = document.createElement('div');
  div.classList.add('details-top');
  const posterPathDiv = document.createElement('div');
  posterPathDiv.appendChild(posterPathImageLink(movie));

  div.appendChild(posterPathDiv);
  div.appendChild(detailsTopRight(movie));
  return div;
}

// Create and return the div that is to the right of the poster image and
// contains a number of details about the movie
function detailsTopRight(movie) {
  const div = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = movie.title;

  const tagline = document.createElement('h5');
  tagline.textContent = movie.tagline;

  const rating = document.createElement('p');
  addRatingIcon(movie, rating);

  const releaseDate = document.createElement('p');
  releaseDate.textContent = formatDate(movie.release_date);
  const releaseTitle = spanFor('Release Date: ');
  releaseTitle.classList.add('text-secondary-bold');
  releaseDate.insertBefore(releaseTitle, releaseDate.firstChild);

  const overview = document.createElement('p');
  overview.textContent = movie.overview;

  const genresTitle = document.createElement('h4');
  genresTitle.classList.add('text-secondary');
  genresTitle.textContent = 'Genres';

  const anchor = document.createElement('a');
  anchor.href = movie.homepage;
  anchor.target = '_blank';
  anchor.classList.add('btn');
  anchor.textContent = 'Visit Movie Homepage';
  [
    title,
    tagline,
    rating,
    releaseDate,
    overview,
    genresTitle,
    genreList(movie),
    anchor,
  ].forEach((el) => {
    div.appendChild(el);
  });
  return div;
}

// Create and return the list of movie details appearing at the bottom of the
// details page
function detailsBottomList(movie, providers) {
  const list = document.createElement('ul');
  const budget = {
    span: spanFor('Budget: '),
    listText: currencyFormatter.format(movie.budget),
  };
  const revenue = {
    span: spanFor('Revenue: '),
    listText: currencyFormatter.format(movie.revenue),
  };
  const runtime = {
    span: spanFor('Runtime: '),
    listText: movie.runtime + ' minutes',
  };
  const status = {
    span: spanFor('Status: '),
    listText: movie.status,
  };
  const rentFrom = {
    span: spanFor('Rent from: '),
    listText: providers.rentOrFree,
  };
  const buyFrom = {
    span: spanFor('Buy from: '),
    listText: providers.buy,
  };

  const streamFrom = {
    span: spanFor('Stream from: '),
    listText: providers.stream,
  };
  const productionCompanies = {
    span: spanFor('Production Companies: '),
    listText: movie.production_companies
      .map((company) => company.name)
      .join('; '),
  };

  const languages = {
    span: spanFor('Spoken Languages: '),
    listText: movie.spoken_languages
      .map((language) => language.english_name)
      .join(', '),
  };

  [
    budget,
    revenue,
    runtime,
    status,
    rentFrom,
    buyFrom,
    streamFrom,
    productionCompanies,
    languages,
  ].forEach((el) => {
    el.span.classList.add('text-secondary');
    const li = document.createElement('li');
    li.textContent = el.listText;
    li.insertBefore(el.span, li.firstChild);
    list.appendChild(li);
  });
  return list;
}

//Create and return the div that should appear at the bottom of the details page
function detailsBottom(movie, providers) {
  const div = document.createElement('div');
  div.classList.add('details-bottom');

  const movieInfoTitle = document.createElement('h2');
  movieInfoTitle.textContent = 'Movie Info';

  div.appendChild(movieInfoTitle);
  div.appendChild(detailsBottomList(movie, providers));

  return div;
}

// Display Movie Details
export async function displayMovieDetails() {
  const movieID = window.location.search.split('=')[1];

  const movie = await fetchAPIData(`movie/${movieID}`);
  const providers = await mediaProviders(movieID, false);

  displayBackgroundImage(movie.backdrop_path);

  const div = document.createElement('div');
  div.appendChild(detailsTop(movie));
  div.appendChild(detailsBottom(movie, providers));

  document.querySelector('#movie-details').appendChild(div);
}
