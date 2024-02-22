// Add the rating icon inside the wrapper element (a paragraph or h4)
export function addRatingIcon(media, wrapper) {
  const ratingIcon = document.createElement('i');
  ['fas', 'fa-star', 'text-secondary'].forEach((ratingClass) => {
    ratingIcon.classList.add(ratingClass);
  });
  wrapper.textContent = ` ${media.vote_average.toFixed(1)} / 10`;
  wrapper.insertBefore(ratingIcon, wrapper.firstChild);
}
