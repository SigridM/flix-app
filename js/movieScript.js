import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { currencyFormatter } from './formatters.js';
import {
  cardBodyDiv,
  spanFor,
  mediaProviders,
  detailsTop,
  detailsBottom,
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

// Create and return the list of movie details appearing at the bottom of the
// details page
const detailsBottomList = (movie, providers) => {
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
};

// Display Movie Details
export async function displayMovieDetails() {
  const movieID = window.location.search.split('=')[1];

  const movie = await fetchAPIData(`movie/${movieID}`);
  const providers = await mediaProviders(movieID, false);

  displayBackgroundImage(movie.backdrop_path);

  const div = document.createElement('div');
  div.appendChild(detailsTop(movie));
  div.appendChild(detailsBottom(movie, providers, detailsBottomList));

  document.querySelector('#movie-details').appendChild(div);
}
