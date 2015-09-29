
export default class Modal {

  static template = undefined;

  constructor(data) {
    this.data = data;
    this.$el = $(Modal.template({
      message: data.message ? data.message : data.responseJSON ? data.responseJSON.message : 'Unknown error',
    }));

    this.$el.on('click', this.click.bind(this));
  }

  click() {
    this.$el.remove();
  }
}

// same hack explained in GithubRepoListItem.js
$(document).on('ready', () => {
  Modal.template = _.template($('#template-Modal').html());
});
