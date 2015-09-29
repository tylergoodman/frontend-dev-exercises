import Input from './Input';
import Spinner from './Spinner';

import Modal from './Modal';
import List from './List';
import GithubRepoListItem from './GithubRepoListItem';

import Cache from './Cache';
import GithubQuery from './GithubQuery';

export class App {

  constructor() {}

  start(rootElement) {
    this.$root = $(rootElement);

    this.spinner = new Spinner(this.$root.find('#spinner'));
    this.input = new Input(this.$root.find('#search'), this.search.bind(this, 1));
    this.results = new List(this.$root.find('#results-container'), GithubRepoListItem);
    this.cache = new Cache(50);

    this.$next = this.$root.find('#next');
    this.$prev = this.$root.find('#previous');
    this.$next.on('click', this.getNext.bind(this));
    this.$prev.on('click', this.getPrev.bind(this));

    this.currentQuery = undefined;
    this.currentPage = 1;
  }


  set hasPrev(value) {
    this.$prev.attr('disabled', !value);
  }

  set hasNext(value) {
    this.$next.attr('disabled', !value);
  }

  getNext() {
    // so we can't spam the button while it's loading...
    this.$next.add(this.$prev).attr('disabled', true);
    this.search(++this.currentPage, this.currentQuery);
  }
  getPrev() {
    this.$next.add(this.$prev).attr('disabled', true);
    this.search(--this.currentPage, this.currentQuery);
  }

  search(page, keyword) {
    // start our spinner
    this.spinner.spin();

    // update our state
    this.currentQuery = keyword;
    this.currentPage = page;

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

        if (page < ghQuery.total_pages) {
          this.hasNext = true;
        }
        else {
          this.hasNext = false;
        }

        if (page > 1) {
          this.hasPrev = true;
        }
        else {
          this.hasPrev = false;
        }

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
