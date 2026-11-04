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
const clearButton = [...numberButtons].find(button => button.textContent.trim() === "AC");
const backspaceButton = [...numberButtons].find(button => button.textContent.trim() === "⌫");
const percentButton = [...numberButtons].find(button => button.textContent.trim() === "%");
const signButton = [...numberButtons].find(button => button.textContent.trim() === "±");
const equalsButton = [...numberButtons].find(button => button.textContent.trim() === "=");

let isScientific = false;

modeToggle.addEventListener("click", () => {
    isScientific = !isScientific;
    modeLabel.textContent = isScientific ? "Scientific" : "Standard";
    scientificButtons.classList.toggle("hidden", !isScientific);
    scientificButtons.classList.toggle("grid", isScientific);
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    moonIcon.classList.toggle("hidden");
    sunIcon.classList.toggle("hidden");
});

// Calculator State
let currentInput = "0";
let expression = "";
let fullExpression = "";
let justCalculated = false;

function updateDisplay() {
    resultDisplay.textContent = currentInput;
    expressionDisplay.textContent = expression;
}

updateDisplay();

function handlePercentage() {
    if (currentInput === "Error" || currentInput === "Infinity") return;

    const percentage = Number(currentInput);
    const match = fullExpression.match(/^(.*)([+\-×÷])(-?\d*\.?\d+)$/);

    if (match) {
        const previousNumber = Number(match[1]);
        const lastOperator = match[2];

        if (lastOperator === "+" || lastOperator === "−") {
            currentInput = String(previousNumber * percentage / 100);
        } else {
            currentInput = String(percentage / 100);
        }

        fullExpression = match[1] + lastOperator + currentInput;
    } else {
        currentInput = String(percentage / 100);
        fullExpression = currentInput;
    }

    justCalculated = false;
    expression = fullExpression;
    updateDisplay();
}

// Number and Operator Buttons
numberButtons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent.trim();

        // Start a fresh calculation after equals
        if (justCalculated && !isNaN(value)) {
            currentInput = "0";
            fullExpression = "";
            expression = "";
            justCalculated = false;
        }

        if (!isNaN(value)) {
            if (currentInput === "Error" || currentInput === "Infinity") {
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
            if (currentInput === "Error" || currentInput === "Infinity") return;

            fullExpression += value;
            expression = fullExpression;
            currentInput = "0";
            justCalculated = false;
        }

        updateDisplay();
    });
});

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
        currentInput = String(
            Number.isFinite(result) ? Number(result.toFixed(10)) : "Infinity"
        );

        fullExpression = currentInput;
        justCalculated = true;
        updateDisplay();
    } catch {
        currentInput = "Error";
        expression = fullExpression;
        fullExpression = "";
        justCalculated = false;
        updateDisplay();
    }
});

// AC Button
clearButton.addEventListener("click", () => {
    currentInput = "0";
    expression = "";
    fullExpression = "";
    justCalculated = false;
    updateDisplay();
});

// Backspace Button
backspaceButton.addEventListener("click", () => {
    if (currentInput === "Error" || currentInput === "Infinity") {
        currentInput = "0";
        fullExpression = "";
        expression = "";
    } else {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = "0";
        }

        fullExpression = fullExpression.slice(0, -1);
    }

    justCalculated = false;
    updateDisplay();
});

// Percentage Button
percentButton.addEventListener("click", handlePercentage);

// Sign Button
signButton.addEventListener("click", () => {
    if (currentInput === "0" || currentInput === "Error" || currentInput === "Infinity") return;

    if (currentInput.startsWith("-")) {
        currentInput = currentInput.slice(1);
    } else {
        currentInput = "-" + currentInput;
    }

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
        const button = [...numberButtons].find(btn => btn.textContent.trim() === key);
        button?.click();
    } else if (key === ".") {
        const decimalButton = [...numberButtons].find(btn => btn.textContent.trim() === ".");
        decimalButton?.click();
    } else if (key === "+") {
        const button = [...numberButtons].find(btn => btn.textContent.trim() === "+");
        button?.click();
    } else if (key === "-") {
        const button = [...numberButtons].find(btn => btn.textContent.trim() === "−");
        button?.click();
    } else if (key === "*") {
        const button = [...numberButtons].find(btn => btn.textContent.trim() === "×");
        button?.click();
    } else if (key === "/") {
        event.preventDefault();
        const button = [...numberButtons].find(btn => btn.textContent.trim() === "÷");
        button?.click();
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