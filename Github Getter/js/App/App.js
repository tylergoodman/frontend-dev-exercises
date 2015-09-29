import Input from './Input';
import Spinner from './Spinner';
import Modal from './Modal';
import Paginator from './Paginator';

import List from './List';
import GithubRepoListItem from './GithubRepoListItem';

import Cache from './Cache';
import GithubQuery from './GithubQuery';

export class App {

  constructor() {}

  start(rootElement) {
    this.$root = $(rootElement);

    // initialize components
    this.spinner = new Spinner(this.$root.find('#spinner'));
    this.input = new Input(this.$root.find('#search'), this.search.bind(this, 1));
    this.results = new List(this.$root.find('#results-container'), GithubRepoListItem);
    this.paginator = new Paginator(this.$root.find('#paginator'), this.search.bind(this));

    this.cache = new Cache(50);
  }

  // handler for our search input
  search(page, keyword) {
    // start our spinner
    this.spinner.spin();

    // check our cache
    let ghQuery = this.cache.get(keyword);

    // make new query if we don't have it cached
    if (!ghQuery) {
      ghQuery = new GithubQuery(keyword);
      this.cache.push(keyword, ghQuery);
    }

    // get page for query
    ghQuery.getPage(page)
      .then((list) => {
        // update views
        this.results.set(list);
        this.results.update();

        this.paginator.currentQuery = keyword;
        this.paginator.currentPage = page;
        this.paginator.hasNext = (page < ghQuery.total_pages);
        this.paginator.hasPrev = (page > 1);

        this.spinner.stop();
      })
      .catch((error) => {
        console.log(error);
        // give error in modal
        this.$root.append(new Modal(error).$el);

        this.spinner.stop();
      })
      .then(() => {
        scrollTo(0, 0);
      });
  }
}

export default new App;
