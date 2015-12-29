module("core");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.Big, "Base.Big");
});
