function includeHTML(path, elementID, alsoDo = null) {
  fetch(path)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById(elementID).innerHTML = html;
      if (alsoDo) {
        alsoDo();
      }
    });
}
