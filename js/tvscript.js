import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import {
  cardBodyDiv,
  spanFor,
  mediaProviders,
  detailsTop,
  detailsBottom,
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

// Create and return the list of movie details appearing at the bottom of the
// details page
const detailsBottomList = (tvShow, providers) => {
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
};

// Display TV Details page
export async function displayTVShowDetails() {
  const showID = window.location.search.split('=')[1];
  const tvShow = await fetchAPIData(`tv/${showID}`);
  const providers = await mediaProviders(showID, true);

  displayBackgroundImage(tvShow.backdrop_path, true);

  const div = document.createElement('div');
  div.appendChild(detailsTop(tvShow, true));
  div.appendChild(detailsBottom(tvShow, providers, detailsBottomList, true));

  document.querySelector('#tv-details').appendChild(div);
}
