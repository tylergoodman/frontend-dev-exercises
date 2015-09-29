// wrapper for our terminal-like spinner
export default class Spinner {
  constructor($element) {
    this.$root = $element;
  }
  spin() {
    this.$root.addClass('spin');
  }
  stop() {
    this.$root.removeClass('spin');
  }
}
