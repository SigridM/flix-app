import { global } from './globals.js';
import {
  posterPathImageLink,
  displaySlider,
  displayBackgroundImage,
} from './imageManagement.js';
import { fetchAPIData } from './fetchData.js';
import { formatDate } from './formatters.js';

// Display the 20 most popular tv shows
export async function displayPopularTVShows() {
  const { results } = await fetchAPIData('tv/popular');
  //   console.log(results);

  results.forEach((tvShow) => {
    const div = document.createElement('div');
    div.classList.add('card');

    div.innerHTML = ` 
          <a href="tv-details.html?id=${tvShow.id}">${posterPathImageLink(
      tvShow,
      true
    )}
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

async function tvShowProviders(showID) {
  const tvShowProviders = await fetchAPIData(`tv/${showID}/watch/providers`);
  const providers = {
    buy: '',
    stream: '',
  };
  console.log(tvShowProviders.results);
  if (!tvShowProviders.results.US) {
    return providers;
  }
  if (tvShowProviders.results.US.buy) {
    providers.buy = tvShowProviders.results.US.buy
      .map((buy) => buy.provider_name)
      .join('; ');
  }
  if (tvShowProviders.results.US.flatrate) {
    providers.stream = tvShowProviders.results.US.flatrate
      .map((stream) => stream.provider_name)
      .join('; ');
  }
  return providers;
}
// Display TV Details
export async function displayTVShowDetails() {
  const showID = window.location.search.split('=')[1];
  const tvShow = await fetchAPIData(`tv/${showID}`);
  console.log(tvShow);

  const providers = await tvShowProviders(showID);
  console.log(providers);
  displayBackgroundImage(tvShow.backdrop_path, true);

  const div = document.createElement('div');
  //   const rating = Math.round(movie.vote_average);
  const rating = tvShow.vote_average.toFixed(1);

  const fromDate = formatDate(tvShow.first_air_date);
  const toDate = formatDate(tvShow.last_air_date);
  const runtime = tvShow.episode_run_time[0]
    ? `${tvShow.episode_run_time[0]} minutes`
    : 'unavailable';

  div.innerHTML = `<div class="details-top">
    <div>
    ${posterPathImageLink(tvShow, true)}
    </div>
    <div>
      <h2>${tvShow.name}</h2>
      <h5>${tvShow.tagline}</h5>
      <p>
        <i class="fas fa-star text-primary"></i>
        ${rating} / 10
      </p>
      <p class="text-muted">Aired from ${fromDate} to ${toDate}</p>
      <p>${tvShow.overview}</p>
      <h4>Genres</h4>
      <ul class="list-group">
      ${tvShow.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
      </ul>
      <a href="${
        tvShow.homepage
      }" target="_blank" class="btn">Visit Show Homepage</a>
    </div>
  </div>
  <div class="details-bottom">
    <h2>Show Info</h2>
    <ul>
    <li><span class="text-secondary">Number Of Episodes:</span> ${
      tvShow.number_of_episodes
    }</li>    
    <li><span class="text-secondary">Number Of Seasons:</span> ${
      tvShow.number_of_seasons
    }</li>
      <li>
        <span class="text-secondary">Last Episode To Air:</span> ${
          tvShow.last_episode_to_air.name
        }
      </li>
      <li><span class="text-secondary">Status:</span> ${tvShow.status}</li>
      <li><span class="text-secondary">Episode Runtime:</span> ${runtime} </li>
      <li><span class="text-secondary">Buy from:</span> ${providers.buy} </li>
      <li><span class="text-secondary">Stream from:</span> ${
        providers.stream
      } </li>
      
    </ul>
    <h4>Production Companies</h4>
    <div class="list-group">${tvShow.production_companies
      .map((company) => `<span>${company.name}</span>`)
      .join('; ')}</div>
  </div>`;
  document.querySelector('#tv-details').appendChild(div);
}
