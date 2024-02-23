import {
  posterPathImageLink,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { cardBodyDiv, detailsTop, detailsBottom } from './commonElements.js';

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

// Display TV Details page
export async function displayTVShowDetails() {
  const showID = window.location.search.split('=')[1];
  const tvShow = await fetchAPIData(`tv/${showID}`);

  displayBackgroundImage(tvShow.backdrop_path, true);

  const div = document.createElement('div');
  const bottom = await detailsBottom(tvShow, showID, true);

  div.appendChild(detailsTop(tvShow, true));
  div.appendChild(bottom);

  document.querySelector('#tv-details').appendChild(div);
}
