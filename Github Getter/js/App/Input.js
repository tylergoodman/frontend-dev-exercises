
// our custom Input 'component' to wrap our input element management with
export default class Input {

  constructor($element, handler) {

    this.$root = $element;

    this.$text = this.$root.find('input[type="text"]');
    this.$button = this.$root.find('button');

    if (handler !== undefined) {
      this.bind(handler);
    }
  }

  _getVal() {
    return this.$text.val();
  }

  // bind a handler for this input component
  // chose not to use forms for this for some reason
  bind(handler) {
    this.$text.on('keypress', (event) => {
      const val = this._getVal();
      if (event.keyCode === 13 && val.length) {
        handler(val);
      }
    });
    this.$button.on('click', (event) => {
      const val = this._getVal();
      if (val.length) {
        handler(val);
      }
    });
  }

  unbind() {
    this.$text.off();
    this.$button.off();
  }

  remove() {
    this.unbind();
    this.$root.remove();
  }
}
