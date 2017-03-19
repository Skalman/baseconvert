// Create the base converter object to be used in the app.
var converter = new Base({
    Big: Big,
    extensions: [extRoman, extTwosComplement, extImaginary, extStandard, extLeet]
});
