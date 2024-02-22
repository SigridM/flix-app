// Format the given string as short month date, year
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-us', {
    //   weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  //   console.log(months[date.getMonth()], date.getDate(), date.getFullYear());
}

// Create  number formatter
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export function ratingIcon(media) {}
