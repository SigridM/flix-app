import { fetchAPIData } from './fetchData.js';

function noImage(isTV = false) {
  const alt = isTV ? 'Show Title' : 'Movie Title';
  return `<img
      src="../images/no-image.jpg"
      class="card-img-top"
      alt=${alt}
      />`;
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

export function posterPath(media, isTV = false) {
  const alt = isTV ? media.name : media.title;
  return media.poster_path //'w500' means width of 500
    ? `<img
        src="https://image.tmdb.org/t/p/w500${media.poster_path}"
        class="card-img-top"
        alt="${alt}"
        />`
    : noImage(isTV);
}

// Display Slider of Now Playing moivies or Top Rated TV; default is movies
export async function displaySlider(isTV = false) {
  const { results } = isTV
    ? await fetchAPIData('tv/top_rated')
    : await fetchAPIData('movie/now_playing');

  const detailsPage = isTV ? 'tv-details.html' : 'movie-details.html';
  //   console.log(results);

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide'); // a single slide, clicking on it takes to movie details
    div.innerHTML = `<a href="${detailsPage}?id=${movie.id}">${posterPath(
      movie,
      isTV
    )}
  </a>
  <h4 class="swiper-rating">
    <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
      1
    )} / 10
  </h4>
    `;
    // console.log(div);
    document.querySelector('.swiper-wrapper').appendChild(div);
    initSwiper(isTV);
  });
}

// Display Backdrop on Details Page
export function displayBackgroundImage(path, isTV = false) {
  const overlayDiv = document.createElement('div');
  overlayDiv.style.backgroundImage = `url(https:/image.tmdb.org/t/p/original/${path})`; // 'original' meand original size
  overlayDiv.classList.add('overlay');

  if (isTV) {
    document.querySelector('#tv-details').appendChild(overlayDiv);
  } else {
    document.querySelector('#movie-details').appendChild(overlayDiv);
  }
}
