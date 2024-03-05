import { fetchAPIData } from './fetchData';

export async function addFilterListeners(isTV = false) {
  const genreFilter = document.querySelector('#genre-filter');
  const genreList = await getGenres(isTV);
  genreFilter.addEventListener('change', function () {
    if (genreFilter.checked) {
      console.log('Genre checkbox is checked');
      createGenreCheckboxes(genreList);
    } else {
      clearGenreCheckboxes();
    }
  });

  const adultFilter = document.querySelector('#adult-filter');
  adultFilter.addEventListener('change', function () {
    if (adultFilter.checked) {
      console.log('adult checkbox is checked');
    } else {
      console.log('adult checkbox is unchecked');
    }
  });

  const languageFilter = document.querySelector('#language-filter');
  languageFilter.addEventListener('change', function () {
    if (languageFilter.checked) {
      console.log('language checkbox is checked');
    } else {
      console.log('language checkbox is unchecked');
    }
  });
  const sortBy = document.querySelector('#sort-by');
  sortBy.addEventListener('change', function () {
    if (sortBy.checked) {
      console.log('sort-by checkbox is checked');
    } else {
      console.log('sort-by checkbox is unchecked');
    }
  });
  //@todo: put a span with flexible spacing in the filter.html with a space for a menu element
}

async function getGenres(isTV) {
  const genreContainer = document.querySelector('#genre-container');
  // @todo - get the list of genres from the API
  const endPoint = `genre/${isTV ? 'tv' : 'movie'}/list`;
  const genres = await fetchAPIData(endPoint);
  console.log(genres);
  return genres;
}
function createGenreCheckboxes(genres) {
  ['comedy', 'drama', 'action', 'horror'].forEach((genre) => {
    const checkbox = createCheckbox(genre, genre.toUpperCase());
    genreContainer.appendChild(checkbox);
  });
  //@todo - find a way to add an And vs. Or radio button group after this
}

function createCheckbox(id, labelText) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;

  const label = document.createElement('label');
  //   label.setAttribute('for', id);
  label.textContent = '  ' + labelText;

  const br = document.createElement('br');

  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('checkbox-container');
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  checkboxContainer.appendChild(br);

  return checkboxContainer;
}

function clearGenreCheckboxes() {
  // Remove all child nodes from the container
  const genreContainer = document.querySelector('#genre-container');
  while (genreContainer.firstChild) {
    genreContainer.removeChild(genreContainer.firstChild);
  }
}
