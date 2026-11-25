const speed = document.getElementById("speed");
const torque = document.getElementById("torque");
const cost = document.getElementById("cost");

const speedP = document.getElementById("speedPriority");
const torqueP = document.getElementById("torquePriority");
const costP = document.getElementById("costPriority");

const scoreOut = document.getElementById("score");
const evalOut = document.getElementById("evaluation");
const focusOut = document.getElementById("focus");
const statusOut = document.getElementById("priorityStatus");

const canvas = document.getElementById("barChart");
const ctx = canvas.getContext("2d");

const designList = document.getElementById("designList");
let savedDesigns = [];

function updateValues() {
    document.getElementById("speedVal").textContent = speed.value;
    document.getElementById("torqueVal").textContent = torque.value;
    document.getElementById("costVal").textContent = cost.value;
}

function getWeights() {
    const s = Number(speedP.value);
    const t = Number(torqueP.value);
    const c = Number(costP.value);

    if (s < 0 || t < 0 || c < 0) {
        statusOut.textContent = "Priorities cannot be negative";
        statusOut.style.color = "red";
        return null;
    }

    const total = s + t + c;

    // float tolerance
    if (Math.abs(total - 100) > 0.01) {
        statusOut.textContent = `Priority total must equal 100 (Current: ${Number(total.toFixed(2))})`;
        statusOut.style.color = "red";
        return null;
    }

    statusOut.textContent = "Priority distribution valid";
    statusOut.style.color = "green";

    return {
        speed: s / 100,
        torque: t / 100,
        cost: c / 100
    };
}

function calculate() {
    const weights = getWeights();
    if (!weights) {
        drawChart(null);
        scoreOut.textContent = "—";
        evalOut.textContent = "Fix priority inputs to evaluate";
        focusOut.textContent = "—";
        return;
    }

    const parts = [
        { label: "Speed", value: speed.value * weights.speed, color: "#0077b6" },
        { label: "Torque", value: torque.value * weights.torque, color: "#00b4d8" },
        { label: "Cost", value: -cost.value * weights.cost, color: "#adb5bd" },
        // torque penalty
        { label: "Penalty", value: torque.value < 5 ? -1 : 0, color: "#d62828" }
    ];
    const score = parts.reduce((sum, part) => sum + part.value, 0);

    drawChart([...parts, { label: "Score", value: score, color: "#1b263b" }]);

    scoreOut.textContent = score.toFixed(2);

    if (torque.value < 5)
        evalOut.textContent = "Fails minimum torque constraint";
    else if (score >= 6)
        evalOut.textContent = "Well-balanced trade-off";
    else if (score >= 4)
        evalOut.textContent = "Acceptable trade-off";
    else
        evalOut.textContent = "Not optimal";

    // python rule
    const speedRating = Number(speed.value);
    const torqueRating = Number(torque.value);
    const costRating = Number(cost.value);

    if (speedRating > torqueRating && speedRating > costRating)
        focusOut.textContent = "Performance-focused (speed-driven)";
    else if (torqueRating > speedRating && torqueRating > costRating)
        focusOut.textContent = "Power-focused (torque-driven)";
    else if (costRating < speedRating && costRating < torqueRating)
        focusOut.textContent = "Cost-efficient";
    else
        focusOut.textContent = "Balanced properties";
}

function resizeCanvas() {
    // sharp screens
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = width / 2;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawChart(parts) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.font = "12px Arial";

    if (!parts) {
        ctx.fillStyle = "#555";
        ctx.fillText("Fix the priorities to see the chart", w / 2, h / 2);
        return;
    }

    const zero = h * 0.42;
    const unit = (h * 0.3) / 10;
    const barWidth = w / 10;

    // zero line
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    ctx.moveTo(w * 0.05, zero);
    ctx.lineTo(w * 0.95, zero);
    ctx.stroke();

    parts.forEach((part, i) => {
        const center = w * (0.15 + i * 0.175);
        const height = part.value * unit;

        ctx.fillStyle = part.color;
        ctx.fillRect(center - barWidth / 2, zero - Math.max(height, 0), barWidth, Math.abs(height));

        ctx.fillStyle = "#000";
        const valueY = part.value >= 0 ? zero - height - 6 : zero - height + 14;
        ctx.fillText(part.value.toFixed(2), center, valueY);
        ctx.fillText(part.label, center, h - 6);
    });
}

document.getElementById("saveBtn").addEventListener("click", () => {
    const score = Number(scoreOut.textContent);

    // invalid priorities
    if (Number.isNaN(score)) {
        statusOut.textContent = "Fix the priorities before saving a design";
        statusOut.style.color = "red";
        return;
    }

    const name =
        document.getElementById("designName").value.trim() || "Unnamed Design";

    savedDesigns.push({ name, score });

    // rank designs
    savedDesigns.sort((a, b) => b.score - a.score);

    renderSaved();
});

function renderSaved() {
    designList.innerHTML = "";
    savedDesigns.forEach((d, i) => {
        const div = document.createElement("div");
        div.className = "design-card";

        // plain text
        const title = document.createElement("strong");
        title.textContent = `${i + 1}. ${d.name}`;

        div.append(title, document.createElement("br"), `Score: ${d.score.toFixed(2)}`);
        designList.appendChild(div);
    });
}

[speed, torque, cost, speedP, torqueP, costP].forEach(el =>
    el.addEventListener("input", () => {
        updateValues();
        calculate();
    })
);

window.addEventListener("resize", () => {
    resizeCanvas();
    calculate();
});

resizeCanvas();
updateValues();
calculate();
