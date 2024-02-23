import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { cardBodyDiv, detailsTop, detailsBottom } from './commonElements.js';

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

// Display Movie Details
export async function displayMovieDetails() {
  const movieID = window.location.search.split('=')[1];
  const movie = await fetchAPIData(`movie/${movieID}`);

  displayBackgroundImage(movie.backdrop_path);

  const div = document.createElement('div');
  const bottom = await detailsBottom(movie, movieID);

  div.appendChild(detailsTop(movie));
  div.appendChild(bottom);

  document.querySelector('#movie-details').appendChild(div);
}
