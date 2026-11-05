const modeToggle = document.getElementById("modeToggle");
const modeLabel = document.getElementById("modeLabel");
const scientificButtons = document.getElementById("scientificButtons");
const themeToggle = document.getElementById("themeToggle");
const moonIcon = document.getElementById("moonIcon");
const sunIcon = document.getElementById("sunIcon");

// Display Elements
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const numberButtons = document.querySelectorAll("#calculatorButtons button");
const scientificButtonElements = document.querySelectorAll("#scientificButtons button");

const findButton = label =>
    [...numberButtons].find(button => button.textContent.trim() === label);

const clearButton = findButton("AC");
const backspaceButton = findButton("⌫");
const percentButton = findButton("%");
const signButton = findButton("±");
const equalsButton = findButton("=");

let isScientific = false;
let currentInput = "0";
let expression = "";
let fullExpression = "";
let justCalculated = false;

// Display
function updateDisplay() {
    resultDisplay.textContent = currentInput;
    expressionDisplay.textContent = expression;
}

updateDisplay();

// Mode Toggle
modeToggle.addEventListener("click", () => {
    isScientific = !isScientific;
    modeLabel.textContent = isScientific ? "Scientific" : "Standard";
    scientificButtons.classList.toggle("hidden", !isScientific);
    scientificButtons.classList.toggle("grid", isScientific);
});

// Theme Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    moonIcon.classList.toggle("hidden");
    sunIcon.classList.toggle("hidden");
});

// Reset
function clearCalculator() {
    currentInput = "0";
    expression = "";
    fullExpression = "";
    justCalculated = false;
    updateDisplay();
}

// Percentage
function handlePercentage() {
    if (currentInput === "Error" || currentInput.includes("Infinity")) return;

    const percentage = Number(currentInput);
    const match = fullExpression.match(/^(.*)([+\-×÷])(-?\d*\.?\d+)$/);

    if (match) {
        const previousNumber = Number(match[1]);
        const operator = match[2];

        if (operator === "+" || operator === "−") {
            currentInput = String(previousNumber * percentage / 100);
        } else {
            currentInput = String(percentage / 100);
        }

        fullExpression = match[1] + operator + currentInput;
    } else {
        currentInput = String(percentage / 100);
        fullExpression = currentInput;
    }

    expression = fullExpression;
    justCalculated = false;
    updateDisplay();
}

// Number and Operator Buttons
numberButtons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent.trim();

        if (justCalculated && !isNaN(value)) {
            currentInput = "0";
            fullExpression = "";
            expression = "";
            justCalculated = false;
        }

        if (!isNaN(value)) {
            if (currentInput === "Error" || currentInput.includes("Infinity")) {
                currentInput = value;
                fullExpression = value;
                expression = "";
            } else if (currentInput === "0") {
                if (value !== "0") {
                    currentInput = value;

                    if (["+", "−", "×", "÷"].includes(fullExpression.slice(-2, -1)) && fullExpression.endsWith("0")) {
                        fullExpression = fullExpression.slice(0, -1) + value;
                    } else {
                        fullExpression += value;
                    }
                } else if (["+", "−", "×", "÷"].includes(fullExpression.slice(-1))) {
                    fullExpression += value;
                }
            } else {
                currentInput += value;
                fullExpression += value;
            }
        } else if (value === ".") {
            if (!currentInput.includes(".")) {
                currentInput += ".";
                fullExpression += ".";
                justCalculated = false;
            }
        } else if (["+", "−", "×", "÷"].includes(value)) {
            if (currentInput === "Error" || currentInput.includes("Infinity")) return;

            fullExpression += value;
            expression = fullExpression;
            currentInput = "0";
            justCalculated = false;
        }

        updateDisplay();
    });
});

// Scientific Functions
function getCurrentNumberStart() {
    const match = fullExpression.match(/(\d*\.?\d+)$/);
    return match ? fullExpression.length - match[0].length : fullExpression.length;
}

function handleScientificFunction(value) {
    if (currentInput === "Error" || currentInput.includes("Infinity")) return;

    const number = Number(currentInput);
    const start = getCurrentNumberStart();
    const prefix = fullExpression.slice(0, start);
    let result;
    let functionName;

    switch (value) {
        case "√":
            if (number < 0) return showError();
            result = Math.sqrt(number);
            functionName = `√(${currentInput})`;
            break;

        case "x²":
            result = number ** 2;
            functionName = `(${currentInput})²`;
            break;

        case "sin":
            result = Math.sin(number * Math.PI / 180);
            functionName = `sin(${currentInput})`;
            break;

        case "cos":
            result = Math.cos(number * Math.PI / 180);
            functionName = `cos(${currentInput})`;
            break;

        case "tan":
            result = Math.tan(number * Math.PI / 180);
            functionName = `tan(${currentInput})`;
            break;

        case "log":
            if (number <= 0) return showError();
            result = Math.log10(number);
            functionName = `log(${currentInput})`;
            break;

        case "ln":
            if (number <= 0) return showError();
            result = Math.log(number);
            functionName = `ln(${currentInput})`;
            break;

        default:
            return;
    }

    const formatted = formatResult(result);
    if (formatted === "Error") return showError();

    fullExpression = prefix + `(${formatted})`;
    currentInput = formatted;
    expression = functionName;
    justCalculated = true;
    updateDisplay();
}

// Scientific Buttons
scientificButtonElements.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent.trim();

        if (["√", "x²", "sin", "cos", "tan", "log", "ln"].includes(value)) {
            handleScientificFunction(value);
            return;
        }

        if (value === "xʸ") {
            if (currentInput === "Error" || currentInput.includes("Infinity")) return;
            fullExpression += "**";
            expression = fullExpression;
            currentInput = "0";
            justCalculated = false;
        }

        if (value === "π" || value === "e") {
            const constant = value === "π" ? Math.PI : Math.E;
            const constantText = String(constant);

            if (justCalculated) {
                fullExpression = "";
                expression = "";
                justCalculated = false;
            }

            if (currentInput !== "0" && !["+", "−", "×", "÷", "("].includes(fullExpression.slice(-1))) {
                fullExpression += "*";
            }

            fullExpression += constantText;
            currentInput = constantText;
            expression = fullExpression;
        }

        if (value === "(") {
            if (justCalculated) {
                fullExpression = "";
                expression = "";
                currentInput = "0";
                justCalculated = false;
            } else if (currentInput !== "0" && !["+", "−", "×", "÷", "("].includes(fullExpression.slice(-1))) {
                fullExpression += "*";
            }

            fullExpression += "(";
            currentInput = "0";
            expression = fullExpression;
        }

        if (value === ")") {
            fullExpression += ")";
            expression = fullExpression;
            justCalculated = false;
        }

        updateDisplay();
    });
});

// Format Results
function formatResult(result) {
    if (Number.isNaN(result)) return "Error";
    if (result === Infinity) return "Infinity";
    if (result === -Infinity) return "-Infinity";

    return String(Number(result.toFixed(10)));
}

function showError() {
    currentInput = "Error";
    expression = fullExpression;
    fullExpression = "";
    justCalculated = false;
    updateDisplay();
}

// Equals Button
equalsButton.addEventListener("click", () => {
    if (!fullExpression || currentInput === "Error") return;

    try {
        const safeExpression = fullExpression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/−/g, "-");

        const result = Function('"use strict"; return (' + safeExpression + ')')();

        if (Number.isNaN(result)) {
            throw new Error("Invalid calculation");
        }

        expression = fullExpression + " =";
        currentInput = formatResult(result);
        fullExpression = currentInput;
        justCalculated = true;
        updateDisplay();
    } catch {
        showError();
    }
});

// AC Button
clearButton.addEventListener("click", clearCalculator);

// Backspace Button
backspaceButton.addEventListener("click", () => {
    if (currentInput === "Error" || currentInput.includes("Infinity")) {
        clearCalculator();
        return;
    }

    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = "0";
    }

    fullExpression = fullExpression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
});

// Percentage Button
percentButton.addEventListener("click", handlePercentage);

// Sign Button
signButton.addEventListener("click", () => {
    if (currentInput === "0" || currentInput === "Error" || currentInput.includes("Infinity")) return;

    currentInput = currentInput.startsWith("-")
        ? currentInput.slice(1)
        : "-" + currentInput;

    fullExpression = fullExpression.slice(0, -currentInput.replace("-", "").length);
    fullExpression += currentInput;

    justCalculated = false;
    expression = fullExpression;
    updateDisplay();
});

// Keyboard Support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (key >= "0" && key <= "9") {
        findButton(key)?.click();
    } else if (key === ".") {
        findButton(".")?.click();
    } else if (key === "+") {
        findButton("+")?.click();
    } else if (key === "-") {
        findButton("−")?.click();
    } else if (key === "*") {
        findButton("×")?.click();
    } else if (key === "/") {
        event.preventDefault();
        findButton("÷")?.click();
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        equalsButton.click();
    } else if (key === "Backspace") {
        backspaceButton.click();
    } else if (key === "Escape") {
        clearButton.click();
    } else if (key === "%") {
        percentButton.click();
    }
});