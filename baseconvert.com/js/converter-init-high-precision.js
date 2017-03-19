// Create the base converter object to be used in the app.
var converter = new Base({
    Big: BigNumber.another({ DECIMAL_PLACES: 1000, POW_PRECISION: 1000, ERRORS: false }),
    extensions: [extTwosComplement, extImaginary, extStandard, extLeet]
});
