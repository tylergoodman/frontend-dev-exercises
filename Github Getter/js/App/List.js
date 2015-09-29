// generic list class
export default class List {

  constructor($element, itemView) {
    this.$root = $element;

    this.items = [];
    this.itemView = itemView;

    this.update();
  }

  set(newItems) {
    this.items = newItems.map((item) => new this.itemView(item));
  }

  update() {
    this.$root.children().remove();

    if (!this.items.length) {
      return this.$root.append('<div class="list-item">Nothing yet!</div>');
    }

    this.$root.append(this.items.map((item) => item.$el));
  }

  clear() {
    this.items.length = 0;
    this.update();
  }
}
