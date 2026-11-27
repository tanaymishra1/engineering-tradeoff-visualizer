// rating limits
const LOW = 1;
const HIGH = 10;

// torque rule
const MIN_TORQUE = 5;
const TORQUE_PENALTY = 1;

// score cutoffs
const WELL_BALANCED = 75;
const ACCEPTABLE = 50;

function scoreRange(weights) {
    const best =
        HIGH * weights.speed +
        HIGH * weights.torque -
        LOW * weights.cost;

    // includes penalty
    const worst =
        LOW * weights.speed +
        LOW * weights.torque -
        HIGH * weights.cost -
        TORQUE_PENALTY;

    return { best, worst };
}

function findFocus(speed, torque, cost) {
    // python rule
    if (speed > torque && speed > cost)
        return "Performance-focused (speed-driven)";
    if (torque > speed && torque > cost)
        return "Power-focused (torque-driven)";
    if (cost < speed && cost < torque)
        return "Cost-efficient";
    return "Balanced properties";
}

function evaluateDesign(speed, torque, cost, weights) {
    const parts = {
        speed: speed * weights.speed,
        torque: torque * weights.torque,
        cost: -cost * weights.cost,
        // torque penalty
        penalty: torque < MIN_TORQUE ? -TORQUE_PENALTY : 0
    };
    const raw = parts.speed + parts.torque + parts.cost + parts.penalty;

    // scale 0-100
    const range = scoreRange(weights);
    const score = (raw - range.worst) / (range.best - range.worst) * 100;
    const passes = torque >= MIN_TORQUE;

    let evaluation;
    if (!passes)
        evaluation = "Fails minimum torque constraint.";
    else if (score >= WELL_BALANCED)
        evaluation = "Well-balanced trade-off.";
    else if (score >= ACCEPTABLE)
        evaluation = "Acceptable trade-off, but with limitations.";
    else
        evaluation = "Not optimal trade-off.";

    return { parts, raw, score, passes, evaluation, focus: findFocus(speed, torque, cost) };
}

function rankDesigns(designs) {
    // passing first
    return [...designs].sort((a, b) => (b.passes - a.passes) || (b.score - a.score));
}

// node tests
if (typeof module !== "undefined") {
    module.exports = { scoreRange, findFocus, evaluateDesign, rankDesigns };
}
