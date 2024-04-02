export class ExtendedMap extends Map {
  /* Answer the unique key found at the first occurance of a given value. */
  getKeyByValue(value) {
    for (let [key, val] of this.entries()) {
      if (val === value) {
        return key;
      }
    }
    return null; // Return null if value not found
  }

  /* Answer an Array of the values (rather than a MapIterator as the superclass
     answers) */
  values() {
    return Array.from(super.values());
  }
}
