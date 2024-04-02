/* For modularizing the html pages, include the html page described in the file at path,
   and put it in the parent element identified by elementID. If alsoDo is not null, 
   perform that function after including the html in path. */
function includeHTML(path, elementID, alsoDo = null) {
  fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })

    .then((html) => {
      const element = document.getElementById(elementID);
      if (!element) {
        throw new Error('element not found');
      }
      element.innerHTML = html;
      if (alsoDo) {
        alsoDo();
      }
    })
    .catch((error) => {
      console.error('Error processing HTML:', error);
    });
}
