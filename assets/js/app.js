/**
 * Teleprompter Application Logic
 */

// --- 1. State Management ---
const State = {
    isPlaying: false,
    text: '',
    fontSize: 48,
    speed: 3,
    margin: 5,
    isFlipped: true,
    scrollPosition: 0,
    lastFrameTime: 0,
    guideHeight: 50,
    fontFamily: "'Noto Sans TC', sans-serif"
};

// --- 2. DOM Elements ---
const Elements = {
    displayArea: document.getElementById('displayArea'),
    scrollContent: document.getElementById('scrollContent'),
    scriptInput: document.getElementById('scriptInput'),
    fontSizeSlider: document.getElementById('fontSizeSlider'),
    fontSizeDisplay: document.getElementById('fontSizeDisplay'),
    speedSlider: document.getElementById('speedSlider'),
    speedDisplay: document.getElementById('speedDisplay'),
    marginSlider: document.getElementById('marginSlider'),
    marginDisplay: document.getElementById('marginDisplay'),
    btnPlayPause: document.getElementById('btnPlayPause'),
    btnReset: document.getElementById('btnReset'),
    btnFlip: document.getElementById('btnFlip'),
    btnExit: document.getElementById('btnExit'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    flipIndicator: document.getElementById('flipIndicator'),
    guideHeightSlider: document.getElementById('guideHeightSlider'),
    guideHeightDisplay: document.getElementById('guideHeightDisplay'),
    guideLine: document.getElementById('guideLine'),
    fontSelect: document.getElementById('fontSelect')
};

// --- 3. UI Controller ---

function updateUI() {
    // Sync Text
    if (!State.text) {
        Elements.scrollContent.innerHTML = '<div class="text-placeholder">請在下方輸入文字...</div>';
    } else {
        // Simple XSS prevention by replacing newlines with <br> and keeping text nodes
        Elements.scrollContent.innerText = State.text;
        Elements.scrollContent.innerHTML = Elements.scrollContent.innerHTML.replace(/\n/g, '<br>');
    }

    // Sync Font Size
    Elements.scrollContent.style.fontSize = `${State.fontSize}px`;
    Elements.fontSizeDisplay.textContent = `${State.fontSize}px`;

    // Sync Font Family
    Elements.scrollContent.style.fontFamily = State.fontFamily;

    // Sync Speed Display
    Elements.speedDisplay.textContent = State.speed;

    // Sync Margin
    if (Elements.marginDisplay) {
        Elements.marginDisplay.textContent = `${State.margin}%`;
        Elements.scrollContent.style.width = `${100 - (State.margin * 2)}%`;
    }

    // Sync Play/Pause Button
    const icon = Elements.btnPlayPause.querySelector('.icon');
    const text = Elements.btnPlayPause.lastChild;
    const container = document.querySelector('.app-container');

    if (State.isPlaying) {
        icon.textContent = '⏸';
        text.textContent = ' 暫停';
        Elements.btnPlayPause.classList.remove('primary');
        Elements.btnPlayPause.classList.add('secondary');
        // Immersive Mode ON
        container.classList.add('is-playing');
    } else {
        icon.textContent = '▶';
        text.textContent = ' 播放';
        Elements.btnPlayPause.classList.add('primary');
        Elements.btnPlayPause.classList.remove('secondary');
        // Immersive Mode OFF
        container.classList.remove('is-playing');
    }

    // Sync Flip State
    if (State.isFlipped) {
        Elements.displayArea.classList.add('flipped');
        Elements.btnFlip.classList.add('active');
    } else {
        Elements.displayArea.classList.remove('flipped');
        Elements.btnFlip.classList.remove('active');
    }

    // Sync Guide Height
    if (Elements.guideLine) {
        Elements.guideLine.style.top = `${State.guideHeight}%`;
    }
    if (Elements.guideHeightDisplay) {
        Elements.guideHeightDisplay.textContent = `${State.guideHeight}%`;
    }
}

// --- 4. Event Listeners ---

function initEvents() {
    // Text Input
    Elements.scriptInput.addEventListener('input', (e) => {
        State.text = e.target.value;
        updateUI();
    });

    // Font Size
    Elements.fontSizeSlider.addEventListener('input', (e) => {
        State.fontSize = parseInt(e.target.value, 10);
        updateUI();
    });

    // Speed
    Elements.speedSlider.addEventListener('input', (e) => {
        State.speed = parseInt(e.target.value, 10);
        updateUI();
    });

    // Margin
    if (Elements.marginSlider) {
        Elements.marginSlider.addEventListener('input', (e) => {
            State.margin = parseInt(e.target.value, 10);
            updateUI();
        });
    }

    // Guide Height
    if (Elements.guideHeightSlider) {
        Elements.guideHeightSlider.addEventListener('input', (e) => {
            State.guideHeight = parseInt(e.target.value, 10);
            updateUI();
        });
    }

    // Font Family
    if (Elements.fontSelect) {
        Elements.fontSelect.addEventListener('change', (e) => {
            State.fontFamily = e.target.value;
            updateUI();
        });
    }

    // Play/Pause Toggle
    Elements.btnPlayPause.addEventListener('click', togglePlay);

    // Reset
    Elements.btnReset.addEventListener('click', resetScroll);

    // Flip Toggle
    Elements.btnFlip.addEventListener('click', toggleFlip);

    // Exit Button
    if (Elements.btnExit) {
        Elements.btnExit.addEventListener('click', () => {
            resetScroll();
        });
    }

    // Fullscreen Button
    if (Elements.btnFullscreen) {
        Elements.btnFullscreen.addEventListener('click', toggleFullscreen);
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in textarea
        if (document.activeElement === Elements.scriptInput) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault(); // Prevent page scroll
                togglePlay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                adjustScroll(-50);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustScroll(50);
                break;
            case 'Escape':
                if (State.isPlaying) togglePlay();
                // Also nice to exit fullscreen on ESC, but browser does that naturally
                break;
        }
    });

    // Mouse Wheel (Optional manual scroll when paused)
    Elements.displayArea.addEventListener('wheel', (e) => {
        if (!State.isPlaying) {
            e.preventDefault();
            adjustScroll(e.deltaY);
        }
    });
}

// --- 5. Core Logic ---

function togglePlay() {
    State.isPlaying = !State.isPlaying;

    if (State.isPlaying) {
        // Auto-enter fullscreen on play if not already
        if (!document.fullscreenElement) {
            toggleFullscreen();
        }

        State.lastFrameTime = performance.now();
        requestAnimationFrame(renderLoop);
    }
    updateUI();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function resetScroll() {
    State.isPlaying = false;
    State.scrollPosition = 0;

    // Auto-exit fullscreen when stopping
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
    }

    const scrollTarget = document.getElementById('scrollWrapper');
    if (scrollTarget) {
        scrollTarget.scrollTop = 0;
    }
    // Also reset displayArea just in case, though we rely on wrapper now
    Elements.displayArea.scrollTop = 0;

    updateUI();
}

function toggleFlip() {
    State.isFlipped = !State.isFlipped;
    updateUI();
}

function adjustScroll(delta) {
    State.scrollPosition += delta;

    const scrollTarget = document.getElementById('scrollWrapper');
    if (!scrollTarget) return;

    // Boundary checks
    const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;

    if (State.scrollPosition < 0) State.scrollPosition = 0;
    if (State.scrollPosition > maxScroll) State.scrollPosition = maxScroll;

    scrollTarget.scrollTop = State.scrollPosition;
}

function renderLoop(timestamp) {
    if (!State.isPlaying) return;

    const rawSpeed = State.speed;
    let pixelsPerFrame = 0;

    if (rawSpeed > 0) {
        // Formula: 0.2 + (speed / 100)^1.5 * 5
        pixelsPerFrame = 0.2 + Math.pow(rawSpeed / 100, 1.5) * 5;
    }

    if (rawSpeed === 0) pixelsPerFrame = 0;

    // Update Position
    State.scrollPosition += pixelsPerFrame;

    // Apply to DOM
    const scrollTarget = document.getElementById('scrollWrapper');
    if (!scrollTarget) {
        State.isPlaying = false;
        updateUI();
        return;
    }

    scrollTarget.scrollTop = State.scrollPosition;

    // Auto-stop at bottom
    const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
    if (State.scrollPosition >= maxScroll + 50) {
        State.isPlaying = false;
        updateUI();
        return;
    }

    requestAnimationFrame(renderLoop);
}

// --- 6. Initialization ---
function init() {
    updateUI();
    initEvents();
}

init();
