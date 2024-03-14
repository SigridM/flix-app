import { fetchAPIData } from './fetchData.js';
import { SwiperDetailReturnInfo } from './detailReturn.js';

function noImage(isTV = false) {
  const alt = isTV ? 'Show Title' : 'Movie Title';
  const img = document.createElement('img');
  img.src = '../images/no-image.jpg';
  img.classList.add('card-img-top');
  img.alt = alt;
  return img;
}

const imagePaths = {
  original: 'https:/image.tmdb.org/t/p/original/', // 'original' means original size
  width500: 'https://image.tmdb.org/t/p/w500', // 'w500' means width of 500
};

function imageLinkFrom(media, isTV = false) {
  const img = document.createElement('img');
  img.src = imagePaths.width500 + media.poster_path;
  img.alt = isTV ? media.name : media.title;
  img.classList.add('card-img-top');
  return img;
}

export function posterPathImageLink(media, isTV = false) {
  return media.poster_path // if not null
    ? imageLinkFrom(media, isTV)
    : noImage(isTV);
}

// Display Slider of Now Playing moivies or Top Rated TV; default is movies
export async function displaySlider(isTV = false) {
  const { results } = isTV
    ? await fetchAPIData('tv/top_rated')
    : await fetchAPIData('movie/now_playing');

  const returnInfo = new SwiperDetailReturnInfo(isTV);
  returnInfo.displayResults(results);

  // displayResults(results, 'swiper-slide', '.swiper-wrapper', isTV, true);
}

// Display Backdrop on Details Page
export function displayBackgroundImage(path, isTV = false) {
  const overlayDiv = document.createElement('div');
  overlayDiv.style.backgroundImage = `url(${imagePaths.original}${path})`;
  overlayDiv.classList.add('overlay');

  const detailsPage = isTV
    ? document.getElementById('tv-details')
    : document.getElementById('movie-details');
  detailsPage.appendChild(overlayDiv);
}
