
export default class GithubRepoListItem {

  // static template = _.template($('#template-GithubRepoListItem').html());
  static template = undefined;

  constructor(data) {

    // get rid of (potential) html in the description
    data.description = _.escape(data.description);
    // some repos don't have a language apparently
    data.language = data.language || 'Unknown';
    // reference our data
    this.data = data;

    // construct view
    this.$el = $(GithubRepoListItem.template(data));
    // bind handler
    this.$el.on('click', '.title', this.click.bind(this));
  }

  click() {
    this.$el.toggleClass('minimized');
  }
}

// because the html that contains our template isn't fully loaded yet (since this script is in the head)
// wait and get the template when it's available
// in a real application, this would either be inline (polymer or react)
// or fetched for us (angular, etc)
// alternatively, this script could be placed at the end of the html <body>, or we could paste the template inline as a string here
$(document).on('ready', () => {
  GithubRepoListItem.template = _.template($('#template-GithubRepoListItem').html());
});
