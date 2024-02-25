import { displayDetails, displayPopular } from './commonElements.js';

// Display the 20 most popular tv shows
export async function displayPopularTVShows() {
  await displayPopular(true);
}

// Display TV Details page
export async function displayTVShowDetails() {
  await displayDetails(true);
}
