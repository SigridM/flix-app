import { fetchAPIData } from './fetchData.js';

export function addFilterListeners(isTV = false) {
  const genreFilter = document.querySelector('#genre-filter');
  //   const genreList = await getGenres(isTV);
  genreFilter.addEventListener('change', function () {
    if (genreFilter.checked) {
      console.log('Genre checkbox is checked');
      createGenreCheckboxes();
    } else {
      clearGenreCheckboxes();
    }
  });

  const adultFilter = document.querySelector('#adult-filter');
  adultFilter.addEventListener('change', function (event) {
    if (event.target.checked) {
      console.log('adult checkbox is checked');
    } else {
      console.log('adult checkbox is unchecked');
    }
  });

  const languageFilter = document.querySelector('#language-filter');
  languageFilter.addEventListener('change', function (event) {
    if (event.target.checked) {
      console.log('language checkbox is checked');
    } else {
      console.log('language checkbox is unchecked');
    }
  });
  const sortBy = document.querySelector('#sort-by');
  sortBy.addEventListener('change', function (event) {
    if (event.target.checked) {
      console.log('sort-by checkbox is checked');
    } else {
      console.log('sort-by checkbox is unchecked');
    }
  });
  //@todo: put a span with flexible spacing in the filter.html with a space for a menu element
}

function addGenreCheckboxes() {
  const div = document.createElement('div');
  div.classList.add('dropdown');
  const button = document.createElement('button');
  button.classList.add('drop-button');
  button.textContent = 'Genres';
  button.addEventListener('click', showGenres);
  div.appendChild(button);

  document.querySelector('#genre-div').appendChild(div);
}

function showGenres(event) {
  console.log('in showGenres', event);
  const div = document.createElement('div');
  div.classList.add('dropdown-content');
  ['Comedy', 'Drama', 'Action', 'Horror'].forEach((genre) => {
    const itemButton = document.createElement('button');
    itemButton.classList.add('itemButton', 'show');
    itemButton.textContent = genre;
    itemButton.addEventListener('click', toggleGenre);
    div.appendChild(itemButton);
  });
  document.querySelector('#genre-div').appendChild(div);
}

function toggleGenre(event) {
  console.log('in toggleGenre', event);
}

function createGenreCheckboxes() {
  const genreContainer = document.querySelector('#genre-container');
  ['comedy', 'drama', 'action', 'horror'].forEach((genre) => {
    const checkbox = createCheckbox(genre, genre.toUpperCase());
    genreContainer.appendChild(checkbox);
  });
}

function createCheckbox(id, labelText) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = id;

  const label = document.createElement('label');
  label.setAttribute('for', id);
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
