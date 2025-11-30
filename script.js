/**
 * Math Game - Web Implementation
 * Ported from C++ SFML
 */

// --- Game State & Data ---
const GameState = {
    HOME: 'home',
    LEVEL_SELECTION: 'level-selection',
    ABOUT: 'about',
    ARITHMETIC: 'arithmetic',
    ALGEBRA_TOPICS: 'algebra-topics',
    ALGEBRA_DIFF: 'algebra-diff',
    ALGEBRA_QUIZ: 'algebra-quiz', // Used for both Operations and Equations
    ALGEBRA_NOTES: 'algebra-notes'
};

const Difficulty = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD'
};

const AlgebraMode = {
    OPERATIONS: 'OPERATIONS',
    EQUATIONS: 'EQUATIONS'
};

// --- Core Logic (Ported) ---

function normalizeAnswer(s) {
    // Remove spaces, lowercase, normalize symbols
    let out = s.replace(/\s+/g, '').toLowerCase();
    out = out.replace(/\*/g, '×').replace(/\//g, '÷');

    // Handle +- cases
    out = out.replace(/\+\-/g, '-');
    return out;
}

function generateArithmeticQuestion(diff) {
    const q = {};
    const opDist = Math.floor(Math.random() * 4); // 0..3

    if (diff === Difficulty.EASY) {
        let a = Math.floor(Math.random() * 10) + 1;
        let b = Math.floor(Math.random() * 10) + 1;
        let op = opDist % 2; // 0 or 1
        if (op === 0) {
            q.question = `${a} + ${b} = ?`;
            q.correctAnswer = a + b;
        } else {
            if (a < b) [a, b] = [b, a];
            q.question = `${a} - ${b} = ?`;
            q.correctAnswer = a - b;
        }
    } else if (diff === Difficulty.MEDIUM) {
        let a = Math.floor(Math.random() * 20) + 1;
        let b = Math.floor(Math.random() * 20) + 1;
        let op = Math.floor(Math.random() * 4);

        switch (op) {
            case 0:
                q.question = `${a} + ${b} = ?`;
                q.correctAnswer = a + b;
                break;
            case 1:
                if (a < b) [a, b] = [b, a];
                q.question = `${a} - ${b} = ?`;
                q.correctAnswer = a - b;
                break;
            case 2:
                a = (Math.floor(Math.random() * 12)) + 1;
                b = (Math.floor(Math.random() * 12)) + 1;
                q.question = `${a} × ${b} = ?`;
                q.correctAnswer = a * b;
                break;
            case 3:
                b = (Math.floor(Math.random() * 9)) + 1;
                let k = (Math.floor(Math.random() * 8)) + 1;
                a = b * k;
                q.question = `${a} ÷ ${b} = ?`;
                q.correctAnswer = a / b;
                break;
        }
    } else { // HARD
        let op = Math.floor(Math.random() * 4);
        if (op === 2) { // Mult
            let a = Math.floor(Math.random() * 21) + 10;
            let b = Math.floor(Math.random() * 21) + 5;
            q.question = `${a} × ${b} = ?`;
            q.correctAnswer = a * b;
        } else if (op === 3) { // Div
            let b = Math.floor(Math.random() * 19) + 2;
            let k = Math.floor(Math.random() * 8) + 5;
            let a = b * k;
            q.question = `${a} ÷ ${b} = ?`;
            q.correctAnswer = a / b;
        } else {
            let a = Math.floor(Math.random() * 99) + 1;
            let b = Math.floor(Math.random() * 99) + 1;
            if (op % 2 === 0) {
                q.question = `${a} + ${b} = ?`;
                q.correctAnswer = a + b;
            } else {
                q.question = `${a} - ${b} = ?`;
                q.correctAnswer = a - b;
            }
        }
    }
    return q;
}

function generateAlgebraicQuestion(diff) {
    const q = {};
    const coefDist = () => Math.floor(Math.random() * 10) + 1;
    const patternType = Math.floor(Math.random() * 4) + 1;

    if (diff === Difficulty.EASY) {
        let a = coefDist(), b = coefDist(), c = coefDist();
        switch (patternType) {
            case 1:
                q.question = `${a}x + ${b}x = ?`;
                q.correctAnswer = `${a + b}x`;
                q.explanation = `Combine like terms: ${a}x + ${b}x = ${a + b}x`;
                break;
            case 2:
                if (a < b) [a, b] = [b, a];
                q.question = `${a}x - ${b}x = ?`;
                q.correctAnswer = `${a - b}x`;
                q.explanation = `Combine like terms: ${a}x - ${b}x = ${a - b}x`;
                break;
            case 3:
                q.question = `${a}x × ${c} = ?`;
                q.correctAnswer = `${a * c}x`;
                q.explanation = `Multiply coefficient: ${a}x × ${c} = ${a * c}x`;
                break;
            case 4:
                c = (Math.floor(Math.random() * 5)) + 1;
                a = c * ((Math.floor(Math.random() * 5)) + 1);
                q.question = `${a}x ÷ ${c} = ?`;
                q.correctAnswer = `${a / c}x`;
                q.explanation = `Divide coefficient: ${a}x ÷ ${c} = ${a / c}x`;
                break;
        }
    } else if (diff === Difficulty.MEDIUM) {
        let a = coefDist(), b = coefDist(), c = coefDist(), d = coefDist(), k = coefDist();
        switch (patternType) {
            case 1:
                q.question = `(${a}x + ${b}y) + (${c}x + ${d}y) = ?`;
                q.correctAnswer = `${a + c}x + ${b + d}y`;
                q.explanation = `Combine: (${a}+${c})x + (${b}+${d})y`;
                break;
            case 2:
                q.question = `(${a}x + ${b}y) - (${c}x + ${d}y) = ?`;
                let xc = a - c;
                let yc = b - d;
                let yPart = yc >= 0 ? `+ ${yc}y` : `- ${Math.abs(yc)}y`;
                q.correctAnswer = `${xc}x ${yPart}`;
                // Fix for simple string matching if user types + -
                if (yc < 0) q.correctAnswer = `${xc}x - ${Math.abs(yc)}y`;
                else q.correctAnswer = `${xc}x + ${yc}y`;

                q.explanation = `Combine: (${a}-${c})x + (${b}-${d})y`;
                break;
            case 3:
                q.question = `${k}(${a}x + ${b}y) = ?`;
                q.correctAnswer = `${k * a}x + ${k * b}y`;
                q.explanation = `Distribute ${k}: ${k}×${a}x + ${k}×${b}y`;
                break;
            case 4:
                q.question = `(${a}x + ${b}y) × ${c} = ?`;
                q.correctAnswer = `${a * c}x + ${b * c}y`;
                q.explanation = `Distribute ${c}`;
                break;
        }
    } else { // HARD
        let a = coefDist() + 5, b = coefDist() + 5, c = coefDist() + 5;
        let d = coefDist() + 5, e = coefDist() + 5, f = coefDist() + 5, k = coefDist() + 5;
        switch (patternType) {
            case 1:
                q.question = `(${a}x + ${b}y + ${c}z) + (${d}x + ${e}y + ${f}z) = ?`;
                q.correctAnswer = `${a + d}x + ${b + e}y + ${c + f}z`;
                q.explanation = "Combine x, y, and z terms separately.";
                break;
            case 2:
                q.question = `(${a}x + ${b}y + ${c}z) - (${d}x + ${e}y + ${f}z) = ?`;
                q.correctAnswer = `${a - d}x + ${b - e}y + ${c - f}z`;
                q.explanation = "Subtract x, y, and z terms separately.";
                break;
            case 3:
                q.question = `(${a}x + ${b}y)(${c}x + ${d}y) = ?`;
                q.correctAnswer = `${a * c}x^2 + ${a * d + b * c}xy + ${b * d}y^2`;
                q.explanation = "FOIL Method: First, Outer, Inner, Last.";
                break;
            case 4:
                q.question = `(${a}x + ${b}y + ${c}z) × ${k} = ?`;
                q.correctAnswer = `${a * k}x + ${b * k}y + ${c * k}z`;
                q.explanation = `Distribute ${k} to all terms.`;
                break;
        }
    }
    return q;
}

function generateAlgebraicEquation() {
    const q = {};
    const typeDist = Math.floor(Math.random() * 6) + 1;
    const coefDist = () => Math.floor(Math.random() * 10) + 1;
    const constDist = () => Math.floor(Math.random() * 20) + 1;

    switch (typeDist) {
        case 1: { // ax + bx = d
            let a = coefDist(), b = coefDist(), d = constDist();
            q.question = `${a}x + ${b}x = ${d}`;
            q.correctAnswer = `${d}/${a + b}`;
            q.explanation = `${a + b}x = ${d} → x = ${d}/${a + b}`;
            break;
        }
        case 2: { // ax - bx = d
            let a = coefDist(), b = coefDist(), d = constDist();
            q.question = `${a}x - ${b}x = ${d}`;
            q.correctAnswer = `${d}/${a - b}`;
            q.explanation = `${a - b}x = ${d} → x = ${d}/${a - b}`;
            break;
        }
        case 3: { // ax + b = c
            let a = coefDist(), b = coefDist();
            let c = b + coefDist() * a;
            q.question = `${a}x + ${b} = ${c}`;
            q.correctAnswer = `${c - b}/${a}`;
            q.explanation = `${a}x = ${c - b} → x = ${c - b}/${a}`;
            break;
        }
        case 4: { // ax - b = c
            let a = coefDist(), b = coefDist();
            let c = coefDist() * a - b;
            q.question = `${a}x - ${b} = ${c}`;
            q.correctAnswer = `${c + b}/${a}`;
            q.explanation = `${a}x = ${c + b} → x = ${c + b}/${a}`;
            break;
        }
        case 5: { // (1/a)x = d
            let a = coefDist(), d = constDist();
            q.question = `(1/${a})x = ${d}`;
            q.correctAnswer = `${d * a}/1`;
            q.explanation = `Multiply by ${a}: x = ${d * a}`;
            break;
        }
        case 6: { // (1/a)x + (1/b)x = c
            let a = coefDist(), b = coefDist(), c = constDist();
            q.question = `(1/${a})x + (1/${b})x = ${c}`;
            let num = c * a * b;
            let den = a + b;
            q.correctAnswer = `${num}/${den}`;
            q.explanation = `Common denom: (${a + b}/${a * b})x = ${c} → x = ${c * a * b}/${a + b}`;
            break;
        }
    }
    return q;
}

// --- Game Controller ---

class Game {
    constructor() {
        this.state = GameState.HOME;
        this.arithmeticScore = 0;
        this.arithmeticDifficulty = Difficulty.MEDIUM;
        this.currentArithmeticQ = null;
        this.hintUsed = false;

        this.algebraDifficulty = Difficulty.MEDIUM;
        this.currentAlgebraQ = null;
        this.algebraMode = AlgebraMode.OPERATIONS;
        this.algebraInput = "";

        this.notesPage = 0;
        this.notesData = [
            "Algebra Basics:\n\n• Algebra uses symbols and letters to represent numbers\n• Variables (like x, y) represent unknown values\n• Expressions combine variables and numbers with operations\n• Equations show that two expressions are equal\n\nKey Concepts:\n• Coefficient: Number multiplying a variable\n• Constant: Fixed number value\n• Term: Single mathematical expression",
            "Algebraic Expressions:\n\nTypes of Expressions:\n• Monomial: 3x, 5y² (one term)\n• Binomial: 2x + 3, x - 5 (two terms)\n• Polynomial: x² + 2x + 1 (multiple terms)\n\nDegree of Polynomial:\n• Highest power of the variable\n• x² + 3x + 1 has degree 2",
            "Advanced Concepts:\n\nFactoring:\nx² - 4 = (x-2)(x+2)\nx² + 2x + 1 = (x+1)²\n\nExponents Rules:\nxᵃ × xᵇ = xᵃ⁺ᵇ\n(xᵃ)ᵇ = xᵃᵇ\nx⁰ = 1 (when x ≠ 0)"
        ];

        this.init();
    }

    init() {
        this.showScreen(GameState.HOME);
        this.initBackground();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenId}`).classList.add('active');
        this.state = screenId;
    }

    // --- Arithmetic ---
    startArithmetic() {
        this.arithmeticScore = 0;
        document.getElementById('arithmetic-score').innerText = '0';
        this.showScreen(GameState.ARITHMETIC);
        this.nextArithmetic();
    }

    setArithmeticDifficulty(diff) {
        this.arithmeticDifficulty = diff;
        document.querySelectorAll('.difficulty-selector .btn-chip').forEach(b => {
            b.classList.toggle('active', b.dataset.diff === diff);
        });
        this.nextArithmetic();
    }

    nextArithmetic() {
        this.currentArithmeticQ = generateArithmeticQuestion(this.arithmeticDifficulty);
        document.getElementById('arithmetic-question').innerText = this.currentArithmeticQ.question;
        document.getElementById('arithmetic-input').value = '';
        document.getElementById('arithmetic-input').focus();
        document.getElementById('arithmetic-feedback').innerText = '';
        document.getElementById('btn-arithmetic-submit').classList.remove('hidden');
        document.getElementById('btn-arithmetic-next').classList.add('hidden');
        this.hintUsed = false;
    }

    useHint() {
        if (this.hintUsed) return;
        this.hintUsed = true;
        const ans = this.currentArithmeticQ.correctAnswer;
        let hint = "";
        if (Math.abs(ans) < 10) {
            hint = `Hint: answer is a single digit (${ans % 2 === 0 ? "even" : "odd"})`;
        } else {
            const first = Math.abs(ans).toString()[0];
            hint = `Hint: first digit is ${first} (${ans % 2 === 0 ? "even" : "odd"})`;
        }
        const fb = document.getElementById('arithmetic-feedback');
        fb.innerText = hint;
        fb.style.color = 'var(--warning)';
    }

    submitArithmetic() {
        const input = document.getElementById('arithmetic-input').value;
        if (input === '') return;

        const val = parseInt(input);
        const fb = document.getElementById('arithmetic-feedback');

        if (val === this.currentArithmeticQ.correctAnswer) {
            const points = this.hintUsed ? 5 : 10;
            this.arithmeticScore += points;
            document.getElementById('arithmetic-score').innerText = this.arithmeticScore;
            fb.innerText = `🎉 Well done! +${points} points`;
            fb.style.color = 'var(--success)';
        } else {
            fb.innerText = `✖ Wrong. Correct answer: ${this.currentArithmeticQ.correctAnswer}`;
            fb.style.color = 'var(--danger)';
        }

        document.getElementById('btn-arithmetic-submit').classList.add('hidden');
        document.getElementById('btn-arithmetic-next').classList.remove('hidden');
    }

    // --- Algebra ---
    startAlgebraQuiz(diff) {
        this.algebraDifficulty = diff;
        this.algebraMode = AlgebraMode.OPERATIONS;
        this.showScreen(GameState.ALGEBRA_QUIZ);
        document.getElementById('algebra-quiz-title').innerText = "Algebra Operations";
        this.setupKeypad(['x', 'y', '+', '-', '×', '÷', '^', '(', ')', '←', 'Clear']);
        this.nextAlgebra();
    }

    startEquationQuiz() {
        this.algebraMode = AlgebraMode.EQUATIONS;
        this.showScreen(GameState.ALGEBRA_QUIZ);
        document.getElementById('algebra-quiz-title').innerText = "Algebra Equations";
        this.setupKeypad(['x', '=', '+', '-', '/', '1', '2', '3', '(', ')', '←', 'Clear']);
        this.nextAlgebra();
    }

    setupKeypad(keys) {
        const container = document.getElementById('algebra-keypad');
        container.innerHTML = '';
        keys.forEach(k => {
            const btn = document.createElement('button');
            btn.innerText = k;
            if (['x', 'y', '=', '/'].includes(k)) btn.classList.add('var-key');
            btn.onclick = () => this.handleKeypad(k);
            container.appendChild(btn);
        });
    }

    handleKeypad(key) {
        if (key === 'Clear') this.algebraInput = "";
        else if (key === '←') this.algebraInput = this.algebraInput.slice(0, -1);
        else this.algebraInput += key;

        this.updateAlgebraInputDisplay();
    }

    updateAlgebraInputDisplay() {
        document.getElementById('algebra-input-display').innerText = this.algebraInput;
    }

    nextAlgebra() {
        if (this.algebraMode === AlgebraMode.OPERATIONS) {
            this.currentAlgebraQ = generateAlgebraicQuestion(this.algebraDifficulty);
        } else {
            this.currentAlgebraQ = generateAlgebraicEquation();
        }

        document.getElementById('algebra-question').innerText = this.currentAlgebraQ.question;
        this.algebraInput = "";
        this.updateAlgebraInputDisplay();
        document.getElementById('algebra-feedback').innerText = "";
        document.getElementById('btn-algebra-submit').classList.remove('hidden');
        document.getElementById('btn-algebra-next').classList.add('hidden');
    }

    submitAlgebra() {
        if (this.algebraInput === "") return;

        const given = normalizeAnswer(this.algebraInput);
        const correct = normalizeAnswer(this.currentAlgebraQ.correctAnswer);
        const fb = document.getElementById('algebra-feedback');

        if (given === correct) {
            fb.innerText = `🎉 Well done!\n${this.currentAlgebraQ.explanation}`;
            fb.style.color = 'var(--success)';
        } else {
            fb.innerText = `✖ Incorrect\nCorrect: ${this.currentAlgebraQ.correctAnswer}\n${this.currentAlgebraQ.explanation}`;
            fb.style.color = 'var(--danger)';
        }

        document.getElementById('btn-algebra-submit').classList.add('hidden');
        document.getElementById('btn-algebra-next').classList.remove('hidden');
    }

    backFromAlgebraQuiz() {
        if (this.algebraMode === AlgebraMode.OPERATIONS) {
            this.showScreen(GameState.ALGEBRA_DIFF);
        } else {
            this.showScreen(GameState.ALGEBRA_TOPICS);
        }
    }

    // --- Notes ---
    startNotes() {
        this.notesPage = 0;
        this.showScreen(GameState.ALGEBRA_NOTES);
        this.updateNotes();
    }

    updateNotes() {
        document.getElementById('notes-content').innerText = this.notesData[this.notesPage];
        document.getElementById('note-page-indicator').innerText = `Page ${this.notesPage + 1} of ${this.notesData.length}`;
    }

    nextNote() {
        if (this.notesPage < this.notesData.length - 1) {
            this.notesPage++;
            this.updateNotes();
        }
    }

    prevNote() {
        if (this.notesPage > 0) {
            this.notesPage--;
            this.updateNotes();
        }
    }

    // --- Background Animation ---
    initBackground() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        const objects = [];
        const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', 'y', '+', '-', '×', '÷'];
        const colors = ['rgba(255, 200, 200, 0.3)', 'rgba(200, 255, 200, 0.3)', 'rgba(200, 200, 255, 0.3)', 'rgba(255, 255, 200, 0.3)'];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Init objects
        for (let i = 0; i < 30; i++) {
            objects.push({
                x: Math.random() * width,
                y: Math.random() * height,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
                text: symbols[Math.floor(Math.random() * symbols.length)],
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.floor(Math.random() * 20) + 20
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            objects.forEach(obj => {
                obj.x += obj.dx;
                obj.y += obj.dy;

                if (obj.x < 0 || obj.x > width) obj.dx *= -1;
                if (obj.y < 0 || obj.y > height) obj.dy *= -1;

                ctx.font = `${obj.size}px Outfit`;
                ctx.fillStyle = obj.color;
                ctx.fillText(obj.text, obj.x, obj.y);
            });

            requestAnimationFrame(animate);
        };
        animate();
    }

    // --- Global Input Handling ---
    setupGlobalInput() {
        document.addEventListener('keydown', (e) => {
            if (this.state !== GameState.ALGEBRA_QUIZ) return;

            // Prevent default behavior for some keys to avoid scrolling etc.
            if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();

            const key = e.key;

            // Handle Enter for submission
            if (key === 'Enter') {
                // If submit button is visible, submit. If next button is visible, go next.
                if (!document.getElementById('btn-algebra-submit').classList.contains('hidden')) {
                    this.submitAlgebra();
                } else if (!document.getElementById('btn-algebra-next').classList.contains('hidden')) {
                    this.nextAlgebra();
                }
                return;
            }

            // Handle Backspace
            if (key === 'Backspace') {
                this.handleKeypad('←');
                return;
            }

            // Map allowed keys
            const allowed = ['x', 'y', '+', '-', '(', ')', '=', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '^'];

            if (allowed.includes(key)) {
                this.handleKeypad(key);
            } else if (key === '*') {
                this.handleKeypad('×');
            } else if (key === '/') {
                this.handleKeypad('÷'); // Map / to ÷ for display, though logic handles / too
            }
        });
    }
}

// Start Game
const game = new Game();
game.setupGlobalInput();
