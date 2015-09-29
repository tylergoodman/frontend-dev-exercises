import App from './App.js';

window.App = App;

$(document).ready(() => {
  console.dir(App);
  App.start(document.body);
});
