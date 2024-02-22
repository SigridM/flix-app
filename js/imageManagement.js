import { fetchAPIData } from './fetchData.js';
import { addRatingIcon } from './commonElements.js';

function noImage(isTV = false) {
  const alt = isTV ? 'Show Title' : 'Movie Title';
  const img = document.createElement('img');
  img.src = '../images/no-image.jpg';
  img.classList.add('card-img-top');
  img.alt = alt;
  return img;
  //   return `<img
  //       src="../images/no-image.jpg"
  //       class="card-img-top"
  //       alt=${alt}
  //       />`;
}

function initSwiper(isTV = false) {
  const swiperClass = isTV ? '.tv-swiper' : '.swiper';
  const swiper = new Swiper(swiperClass, {
    slidesPerView: 1,
    speed: 400,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
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
  const alt = isTV ? media.name : media.title;
  // console.log(imageLinkFrom(media, isTV), imageLinkFrom(media, isTV).class);
  // console.log(imageLinkFrom(media, isTV).textContent);
  return media.poster_path // if not null
    ? imageLinkFrom(media, isTV)
    : // `<img
      //     src="${imagePaths.width500}${media.poster_path}"
      //     class="card-img-top"
      //     alt="${alt}"
      //     />`
      noImage(isTV);
}

// Create and return the h4 element that contains a rating icon
function swiperRatingIcon(media) {
  const h4 = document.createElement('h4');
  h4.classList.add('swiper-rating');
  addRatingIcon(media, h4);
  return h4;
}

// Display Slider of Now Playing moivies or Top Rated TV; default is movies
export async function displaySlider(isTV = false) {
  const { results } = isTV
    ? await fetchAPIData('tv/top_rated')
    : await fetchAPIData('movie/now_playing');

  const detailsPage = isTV ? 'tv-details.html' : 'movie-details.html';
  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide'); // a single slide, clicking on it takes to movie details

    const anchor = document.createElement('a');
    anchor.href = detailsPage + '?id=' + movie.id;
    anchor.appendChild(posterPathImageLink(movie, isTV));
    div.appendChild(anchor);

    div.appendChild(swiperRatingIcon(movie));

    document.querySelector('.swiper-wrapper').appendChild(div);
    initSwiper(isTV);
  });
}

// Display Backdrop on Details Page
export function displayBackgroundImage(path, isTV = false) {
  const overlayDiv = document.createElement('div');
  overlayDiv.style.backgroundImage = `url(${imagePaths.original}${path})`;
  overlayDiv.classList.add('overlay');

  if (isTV) {
    document.querySelector('#tv-details').appendChild(overlayDiv);
  } else {
    document.querySelector('#movie-details').appendChild(overlayDiv);
  }
}
