export class ExtendedMap extends Map {
  getKeyByValue(value) {
    for (let [key, val] of this.entries()) {
      if (val === value) {
        return key;
      }
    }
    return null; // Return null if value not found
  }
}
