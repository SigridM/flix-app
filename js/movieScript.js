import { displayDetails, displayPopular } from './commonElements.js';

// Display the 20 most popular movies
export async function displayPopularMovies() {
  await displayPopular();
}

// Display Movie Details page
export async function displayMovieDetails() {
  await displayDetails();
}
