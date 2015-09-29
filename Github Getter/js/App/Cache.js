// singly-linked list to manage our cache
// almost not worth making in lieu of using an array to
// keep track of old items
// maybe completely not worth it?
export default class Cache {
  constructor(max_length) {
    this.dict = {};

    this.front = null;
    this.end = null;

    this.length = 0;
    this.max_length = max_length;
  }

  get(key) {
    const val = this.dict[key];
    if (val) {
      return val.value;
    }
    return undefined;
  }

  push(key, value) {
    const item = new CacheItem(key, value);
    this.dict[key] = item;
    if (this.front) {
      this.front.next = item;
    }
    this.front = item;
    this.length++;

    if (this.length > this.max_length) {
      delete this.dict[this.end.key];
      this.end = this.end.next;
      this.length--;
    }
  }
}

class CacheItem {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}
