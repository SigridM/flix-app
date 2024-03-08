function includeHTML(path, elementID, alsoDo = null) {
  console.log('in includeHTML', elementID);

  fetch(path)
    .then((response) => response.text())
    .then((html) => {
      console.log(document.getElementById(elementID));
      document.getElementById(elementID).innerHTML = html;
      if (alsoDo) {
        alsoDo();
      }
    });
}
