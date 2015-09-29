
export default class GithubQuery {

  static PAGE_SIZE = 100;

  constructor(keyword) {
    this.keyword = keyword;
    this.total_pages = undefined;
    this.pages = [];
  }

  getPage(page_num) {
    // reject if we're out of range
    if (this.total_pages && page_num > this.total_pages) {
      return Promise.reject(new RangeError(`No page ${page_num} for query ${this.keyword}`));
    }

    // return our cached page
    let page;
    if (page = this.pages[page_num - 1]) {
      return Promise.resolve(page);
    }

    // query page
    return new Promise((resolve, reject) => {
      // $.getJSON(`https://api.github.com/legacy/repos/search/${query}`)
      $.getJSON(`https://api.github.com/search/repositories?per_page=${GithubQuery.PAGE_SIZE}&page=${page_num}&q=${this.keyword}`)
        .fail((error) => {
          console.log(`failed to get ${this.keyword}:${page_num}`);
          reject(error);
        })
        .done((data) => {
          console.log(`got ${this.keyword}:${page_num}`, data);

          // save our data
          // queries have a maximum of 1000 search results
          this.total_pages = Math.min(1000 / GithubQuery.PAGE_SIZE, Math.floor(data.total_count / GithubQuery.PAGE_SIZE));
          this.pages[page_num - 1] = data.items;

          resolve(data.items);
        });
    });
  }
}
