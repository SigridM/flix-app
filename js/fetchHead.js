// fetchHead.js

// Function to fetch and inject the head content into the current document's head
function fetchAndInjectHead() {
  fetch('./head.html')
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const headContent = parser.parseFromString(html, 'text/html').head;
      document.head.innerHTML = headContent.innerHTML;
    })
    .catch((error) => console.error('Error fetching head content:', error));
}
// Call the function to fetch and inject the head content
fetchAndInjectHead();
