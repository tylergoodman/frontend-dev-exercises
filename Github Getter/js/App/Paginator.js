// wrapper for our pagination logic
export default class Paginator {

  constructor($element, handler) {
    this.$root = $element;
    this.handler = handler;

    this.$next = this.$root.find('.next');
    this.$prev = this.$root.find('.previous');
    this.$next.on('click', this.getNext.bind(this));
    this.$prev.on('click', this.getPrev.bind(this));

    // state
    this.currentQuery = undefined;
    this.currentPage = 1;
  }

  // some fun with es6 setters to handle the ui changes
  set hasPrev(value) {
    this.$prev.attr('disabled', !value);
  }

  set hasNext(value) {
    this.$next.attr('disabled', !value);
  }

  // handlers for our previous/next buttons
  getNext() {
    // so we can't spam the button while it's loading...
    this.$next.add(this.$prev).attr('disabled', true);
    this.handler(++this.currentPage, this.currentQuery);
  }
  getPrev() {
    this.$next.add(this.$prev).attr('disabled', true);
    this.handler(--this.currentPage, this.currentQuery);
  }
}
