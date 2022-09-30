class StringUtilities {

  static sanitize(text) {
    if (typeof text !== "string") { return ""; }

    return text.trim();
  }
}

module.exports = StringUtilities;
