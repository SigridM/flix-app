import { global } from './globals.js';
import {
  posterPathImageLink,
  displaySlider,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { formatDate } from './formatters.js';
import {
  addRatingIcon,
  cardBodyDiv,
  spanFor,
  genreList,
  mediaProviders,
} from './commonElements.js';

// Display the 20 most popular tv shows
export async function displayPopularTVShows() {
  const { results } = await fetchAPIData('tv/popular');

  results.forEach((tvShow) => {
    const div = document.createElement('div');
    div.classList.add('card');

    const anchor = document.createElement('a');
    anchor.href = 'tv-details.html?id=' + tvShow.id;
    anchor.appendChild(posterPathImageLink(tvShow, true));
    div.appendChild(anchor);
    div.appendChild(cardBodyDiv(tvShow, true));

    document.querySelector('#popular-shows').appendChild(div);
  });
}

// Create and return the div that is in the top portion of the window
// containing the movie poster image and other details
function detailsTop(tvShow) {
  const div = document.createElement('div');
  div.classList.add('details-top');
  const posterPathDiv = document.createElement('div');
  posterPathDiv.appendChild(posterPathImageLink(tvShow, true));

  div.appendChild(posterPathDiv);
  div.appendChild(detailsTopRight(tvShow));
  return div;
}

// Create and return the div that is to the right of the poster image and
// contains a number of details about the movie
function detailsTopRight(tvShow) {
  const div = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = tvShow.name;

  const tagline = document.createElement('h5');
  tagline.textContent = tvShow.tagline;

  const rating = document.createElement('p');
  addRatingIcon(tvShow, rating);

  const airedFrom = spanFor('Aired from: ');
  airedFrom.classList.add('text-secondary-bold');
  const fromDate = spanFor(formatDate(tvShow.first_air_date));
  const airedTo = spanFor(' to ');
  airedTo.classList.add('text-secondary-bold');
  const toDate = spanFor(formatDate(tvShow.last_air_date));

  const airDate = document.createElement('p');
  [airedFrom, fromDate, airedTo, toDate].forEach((el) =>
    airDate.appendChild(el)
  );

  const overview = document.createElement('p');
  overview.textContent = tvShow.overview;

  const genresTitle = document.createElement('h4');
  genresTitle.classList.add('text-secondary');
  genresTitle.textContent = 'Genres';

  const anchor = document.createElement('a');
  anchor.href = tvShow.homepage;
  anchor.target = '_blank';
  anchor.classList.add('btn');
  anchor.textContent = 'Visit Show Homepage';
  [
    title,
    tagline,
    rating,
    airDate,
    overview,
    genresTitle,
    genreList(tvShow),
    anchor,
  ].forEach((el) => {
    div.appendChild(el);
  });
  return div;
}

//Create and return the div that should appear at the bottom of the details page
function detailsBottom(tvShow, providers) {
  const div = document.createElement('div');
  div.classList.add('details-bottom');

  const showInfoTitle = document.createElement('h2');
  showInfoTitle.textContent = 'Show Info';

  div.appendChild(showInfoTitle);
  div.appendChild(detailsBottomList(tvShow, providers));

  return div;
}
// Create and return the list of movie details appearing at the bottom of the
// details page
function detailsBottomList(tvShow, providers) {
  const runtimeText = tvShow.episode_run_time[0]
    ? `${tvShow.episode_run_time[0]} minutes`
    : 'unavailable';
  const list = document.createElement('ul');

  const numEpisodes = {
    span: spanFor('Number of Episodes: '),
    listText: tvShow.number_of_episodes,
  };
  const numSeasons = {
    span: spanFor('Number of Seasons: '),
    listText: tvShow.number_of_seasons,
  };
  const lastEpisode = {
    span: spanFor('Last Episode to Air:'),
    listText: tvShow.last_episode_to_air,
  };
  const status = {
    span: spanFor('Status: '),
    listText: tvShow.status,
  };
  const runtime = {
    span: spanFor('Runtime: '),
    listText: runtimeText,
  };

  const freeFrom = {
    span: spanFor('Free from: '),
    listText: providers.buy,
  };
  const buyFrom = {
    span: spanFor('Buy from: '),
    listText: providers.buy,
  };

  const streamfrom = {
    span: spanFor('Stream from: '),
    listText: providers.stream,
  };

  const productionCompanies = {
    span: spanFor('Production Companies: '),
    listText: tvShow.production_companies
      .map((company) => company.name)
      .join('; '),
  };

  const languages = {
    span: spanFor('Spoken Languages: '),
    listText: tvShow.spoken_languages
      .map((language) => language.english_name)
      .join(', '),
  };

  [
    numEpisodes,
    numSeasons,
    lastEpisode,
    status,
    runtime,
    freeFrom,
    buyFrom,
    streamfrom,
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

// Display TV Details page
export async function displayTVShowDetails() {
  const showID = window.location.search.split('=')[1];
  const tvShow = await fetchAPIData(`tv/${showID}`);
  const providers = await mediaProviders(showID, true);

  displayBackgroundImage(tvShow.backdrop_path, true);

  const div = document.createElement('div');
  div.appendChild(detailsTop(tvShow));
  div.appendChild(detailsBottom(tvShow, providers));

  document.querySelector('#tv-details').appendChild(div);
}
