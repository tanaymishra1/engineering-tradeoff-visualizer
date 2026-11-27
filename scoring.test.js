const test = require("node:test");
const assert = require("node:assert");

const { scoreRange, findFocus, evaluateDesign, rankDesigns } = require("./scoring.js");

// same as python
const EQUAL = { speed: 1 / 3, torque: 1 / 3, cost: 1 / 3 };
const WEIGHTS = { speed: 0.4, torque: 0.4, cost: 0.2 };

// close enough
function near(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`);
}

test("range is always 10", () => {
    for (const weights of [EQUAL, WEIGHTS, { speed: 1, torque: 0, cost: 0 }]) {
        const { best, worst } = scoreRange(weights);
        near(best - worst, 10);
    }
});

test("best and worst designs", () => {
    near(evaluateDesign(10, 10, 1, WEIGHTS).score, 100);
    near(evaluateDesign(1, 1, 10, WEIGHTS).score, 0);
});

test("example designs", () => {
    const a = evaluateDesign(8, 6, 3, WEIGHTS);
    const b = evaluateDesign(5, 9, 7, WEIGHTS);
    near(a.score, 72);
    near(b.score, 64);
    assert.strictEqual(a.evaluation, "Acceptable trade-off, but with limitations.");
});

test("low torque", () => {
    // penalty case
    const weak = evaluateDesign(8, 4, 3, WEIGHTS);
    const strong = evaluateDesign(8, 5, 3, WEIGHTS);
    assert.strictEqual(weak.evaluation, "Fails minimum torque constraint.");
    near(strong.score - weak.score, 14);
});

test("cutoffs", () => {
    assert.strictEqual(evaluateDesign(10, 9, 2, WEIGHTS).evaluation, "Well-balanced trade-off.");
    assert.strictEqual(evaluateDesign(5, 5, 9, WEIGHTS).evaluation, "Not optimal trade-off.");
});

test("focus", () => {
    assert.strictEqual(findFocus(10, 9, 5), "Performance-focused (speed-driven)");
    assert.strictEqual(findFocus(5, 8, 3), "Power-focused (torque-driven)");
    assert.strictEqual(findFocus(6, 6, 2), "Cost-efficient");
    assert.strictEqual(findFocus(5, 5, 5), "Balanced properties");
});

test("failing ranks last", () => {
    // higher score
    const fails = { name: "fails", ...evaluateDesign(10, 4, 1, WEIGHTS) };
    const passes = { name: "B", ...evaluateDesign(5, 9, 7, WEIGHTS) };
    near(fails.score, 66);
    assert.deepStrictEqual(rankDesigns([fails, passes]).map((d) => d.name), ["B", "fails"]);
});
