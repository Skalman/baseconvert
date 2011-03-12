/* TODO
	x.clone()
	x.get_number()
	x.abs()
*/

module("Base.Number");

test("Basic requirements", function() {
	expect(2);
	ok(Base, "Base");
	ok(Base.Number, "Base.Number");
});

test("new Base.Number()", function () {
	expect(15);
	var N = Base.Number,
		undefined;

	strEqual(new Base.Number(), 0, "new Base.Number()");
	strEqual(Base.Number(), 0, "Base.Number()");
	strEqual(new N(), 0, "new Number()");
	strEqual(N(), 0, "Number()");

	strEqual(new Base.Number(3.14), 3.14, "new Base.Number(3.14)");
	strEqual(Base.Number(1), 1, "Base.Number(1)");
	strEqual(new N(0.0618), 0.0618, "new Number(0.0618)");
	strEqual(N(0), 0, "Number(0)");

	strEqual(N(N(-42)), -42, "Number(Number(-42))");

	strEqual(N(undefined), 0, "Number(undefined)");
	strEqual(N(null), 0, "Number(null)");
	strEqual(N("-.0618e+2"), -6.18, 'Number("-.0618e+2")');
	strEqual(N("010"), 10, 'Number("010") (not octal)');
	raises(function () {
		N("-");
	}, 'N("-") raises exception');
	raises(function () {
		N("E");
	}, 'N("E") raises exception');
});

test("x.add(y)", function () {
	expect(18);
	var N = Base.Number,
		x, y, z;

	// x.add(y)
	x = N(1);
	y = x.add(4);
	strEqual(x, 5, "Number(1).add(4)");

	ok(x === y, "x.add(4) returns x");

	y = x.add(x);
	ok(x === y, "x.add(x) returns x");
	strEqual(x, 10, "x.add(x)");

	x.add(x, x, x);
	strEqual(x, 40, "x.add(x, x, x)");


	x = N(10);
	x.add(0);
	strEqual(x, 10, "10+0");
	x.add(0.24);
	strEqual(x, 10.24, "10+0.24");
	x.add(-20);
	strEqual(x, -9.76, "10+0.24-20");

	x = N(2);
	y = N(3);
	z = N(7);
	x.add(y);
	strEqual(x, 5, "Number(2).add( Number(3) )");
	strEqual(y, 3, "x.add(y) doesn't change y");

	x.add(y, z);
	strEqual(x, 15, "x.add(y, z)");

	x.add(3, y, 5, z, 2);
	strEqual(x, 35, "x.add(3, y, 5, z, 2)");


	// Number.add(x, y)
	x = N(1);
	y = N(3);
	z = N.add(x, y);

	strEqual(z, 4, "Number.add(x, y)");
	strEqual(N.add(x, y, z), 8, "Number.add(x, y, z)");
	strEqual(N.add(0.25, x, 5, y, -15, z, 0), -1.75, "0.25+1+5+3-15+4+0");
	strEqual(x, 1, "Number.add() doesn't change parameters");
	strEqual(y, 3, "Number.add() doesn't change parameters");
	strEqual(z, 4, "Number.add() doesn't change parameters");
});

test("x.sub(y)", function () {
	expect(4);

	var N = Base.Number,
		x = N(4),
		y = N(-12.8),
		z = N(0.5);

	x.sub(y).sub(z).sub(0).sub(y).sub(z).sub(30.6);
	strEqual(x, -2, "4+12.8-0.5-0+12.8-0.5-30.6");

	x = N.sub(y, 4).sub( N.sub(0, z) );
	strEqual(x, -16.3, "(-12.8-4) - (0-0.5)");

	strEqual(y, -12.8, "x.sub(y) and Number.sub(y, z) don't change y");
	strEqual(z, 0.5, "x.sub(z) and Number.sub(y, z) don't change z");
});

test("x.mul(y)", function () {
	expect(5);

	var N = Base.Number,
		x = N(2),
		y = N(-2.5),
		z = N(0.5);

	x.mul(x, x, x).mul(y, z).mul(1, 1, y, 1, 1);
	strEqual(x, 50, "2*2*2*2*(-2.5)*0.5*1*1*(-2.5)*1*1");

	x = N.mul(-4, y, 2).mul( N.mul(z, -1), N.mul(y, z) );
	strEqual(x, 12.5, "(-4*-2,5*2) * (0.5*-1) * (-2.5*0.5)");

	x.mul(3, 6, 0);
	strEqual(x, 0, "x.mul(0)");

	strEqual(y, -2.5, "x.mul(y) and Number.mul(y, z) don't change y");
	strEqual(z, 0.5, "x.mul(z) and Number.mul(y, z) don't change z");
});

test("x.div(y)", function () {
	expect(6);

	var N = Base.Number,
		x = N(-12.8),
		y = N(4),
		z = N(0.5);

	x.div(y).div(z).div(1).div(-1).div(100);
	strEqual(x, 0.064, "-12.8/4/0.5/1/-1/100");

	x = N.div(y, 32).div( N.div(-2, 2.5) );
	strEqual(x, -0.15625, "(4/32) / (-2/2.5)");

	strEqual(y, 4, "x.div(y) and Number.div(y, z) don't change y");
	strEqual(z, 0.5, "x.div(z) and Number.div(y, z) don't change z");

	raises(function () {
		N.div(0, 0);
	}, "division by zero should throw error");

	try {
		x = N(123);
		x.div(0);
		ok(false, "division by zero should throw error");
	} catch (e) {
		strEqual(x, 123, "trying to divide by zero shouldn't change anything");
	}
});

test("x.mod(y)", function () {
	expect(6);
	// untested: negative values on either side - at the moment undefined

	var N = Base.Number,
		x = N(128),
		y = N(4),
		z = N(5.5);


	x.mod(y);
	strEqual(x, 0, "4 mod 128");

	x = N.mod(y, 2.5).mod( N.mod(17.5, z) );
	strEqual(x, 0.5, "(4 mod 2.5) mod (17.5 mod 5.5)");

	strEqual(y, 4, "x.mod(y) and Number.mod(y, z) don't change y");
	strEqual(z, 5.5, "x.mod(z) and Number.mod(y, z) don't change z");

	raises(function () {
		N.mod(0, 0);
	}, "division by zero should throw error");
	try {
		x = N(123);
		x.mod(0);
		ok(false, "x mod 0 should throw error");
	} catch (e) {
		strEqual(x, 123, "trying to do 'x mod 0' shouldn't change x");
	}
});

test("x.neg()", function () {
	expect(3);

	var N = Base.Number,
		x = N(24.73);

	x.neg().neg().neg();
	strEqual(x, -24.73, "x.neg()");

	x = N.neg(-0.07);
	strEqual(x, 0.07, "N.neg(x)");

	x = N.neg(N(0));
	strEqual(x, 0, "Number.neg(0)");
});

test("x.floor()", function () {
	expect(3);

	var N = Base.Number,
		x;

	x = N(24.73).floor().floor();
	strEqual(x, 24, "x.neg()");

	x = N.floor(-24);

	x = N.neg(-0.07);
	strEqual(x, 0.07, "N.neg(x)");

	x = N.neg(N(0));
	strEqual(x, 0, "Number.neg(0)");
});

test("x.pow(y)", function () {
	expect(4);

	var N = Base.Number,
		x;

	x = N(3).pow(4);
	strEqual(x, 81, "x.pow(y)");

	x.pow(1/4);
	strEqual(x, 3, "x.pow(1/y)");

	x = N.pow(-0.5, 3);
	strEqual(x, -0.125, "N.pow(-x, y)");

	x.pow(-2);
	strEqual(x, 64, "N.pow(-x, -y)");
});

test("x.cmp(y)", function () {
	expect(6);

	var N = Base.Number,
		x = N(-5.2),
		y = N(0),
		z = N(4);

	ok(x.cmp(x) === 0, "x.cmp(x)");
	ok(x.cmp(y) < 0, "-5.2 < 0");
	ok(x.cmp(-5.197) < 0, "-5.2 < -5.197");
	ok(y.cmp(x) > 0, "0 > -5.2");
	ok(y.cmp(0) === 0, "0 = 0");
	ok(x.cmp(z) < 0, "-5.2 < 4");
});

test("x.equals(y)", function () {
	var N = Base.Number,
		x = N(-5.2),
		y = N(0);

	strictEqual(x.equals(x), true, "x.equals(x)");
	strictEqual(y.equals(y), true, "y.equals(y)");
	strictEqual(x.equals(y),  false, "x.equals(y)");
	strictEqual(x.equals(-5.2), true, "x.equals(-5.2)");
	strictEqual(x.equals(-5.1), false, "x.equals(-5.1)");
	strictEqual(y.equals(-0), true, "y.equals(-0)");
	strictEqual(y.equals(1), false, "y.equals(1)");
});

test("Number.make_immutable()", function () {
	var N = Base.Number,
		x, y;

	x = N(4);
	y = x.make_immutable();

	ok(x === y, "x.make_immutable() returns x");
	strEqual(x, 4, "x.make_immutable() doesn't change x");

	raises(function () {
		x.add(6);
	}, "add() shouldn't be allowed");

	raises(function () {
		x.neg();
	}, "neg() shouldn't be allowed");

	y = x.clone();
	raises(function () {
		x.neg();
	}, "object should still be immutable after cloning");

	y.add(6);
	strEqual(y, 10, "immutable.clone() should be mutable");

	y = N(x);
	y.add(6);
	strEqual(y, 10, "Number(immutable) should be mutable");
});


test("Number.ZERO", function () {
	expect(5);
	var N = Base.Number,
		x;
	strEqual(N.ZERO, 0, "has 0-value");
	equal(N.ZERO.equals(0), true, "equals(0)");
	equal(N.ZERO.equals(1), false, "equals(1)");
	raises(function () {
		N.ZERO.add(5);
	}, "should be immutable");

	x = N.add(N.ZERO, 4, N.ZERO);
	strEqual(x, 4, "works as a 0-value");
});

