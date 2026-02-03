// WRAPPER: Wait for HTML to be 100% ready before looking for elements
window.addEventListener('load', () => {
    console.log("System Loaded. Initializing modules...");

    // 1. Boot Sequence
    safeBoot();

    // 2. Tagline
    typeTagline();

    // 3. Counter
    updateCounter();

    // 4. Matrix Rain
    initMatrix();
});

// --- SAFE MODULES ---

function safeBoot() {
    const bootScreen = document.getElementById('boot-screen');
    const bootLines = document.querySelectorAll('.boot-line');

    if(!bootScreen) return; // Skip if missing

    let delay = 0;
    bootLines.forEach((line) => {
        setTimeout(() => {
            line.classList.add('boot-active');
        }, delay);
        delay += Math.random() * 300 + 100;
    });

    setTimeout(() => {
        bootScreen.style.opacity = '0';
        bootScreen.style.pointerEvents = 'none';
    }, delay + 800);
}

// Custom Cursor
const cursor = document.getElementById('cursor');
if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    document.addEventListener('mousedown', () => {
        cursor.classList.add('pulse');
        setTimeout(() => cursor.classList.remove('pulse'), 200);
    });
}

// Hover Effects
const clickables = document.querySelectorAll('a, button, .card, .terminal-window');
clickables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if(cursor) {
            cursor.style.width = '50px';
            cursor.style.height = '50px';
            cursor.style.background = 'rgba(0, 255, 65, 0.1)';
        }
    });
    el.addEventListener('mouseleave', () => {
        if(cursor) {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.background = 'transparent';
        }
    });
});

// Matrix Rain
function initMatrix() {
    const canvas = document.getElementById('matrix');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '0123456789ABCDEF';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';
        for(let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 35);
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

// Live Algorithm
function updateLiveKey() {
    const now = new Date();
    // HTML Elements
    const p1Result = document.getElementById('algo-result');
    const p2Result = document.getElementById('handshake-result');

    // Shared Vars
    const day = now.getDate();
    const monthLetter = now.toLocaleString('en-US', { month: 'narrow' }).toLowerCase()[0];
    const hhmm = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    const weekdayInitial = now.toLocaleString('en-US', { weekday: 'narrow' }).toLowerCase();

    // Update Phase 1
    if (document.getElementById('algo-friendly-date')) {
        document.getElementById('algo-friendly-date').innerText = now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
        document.getElementById('algo-day').innerText = day;
        document.getElementById('algo-month').innerText = monthLetter;
        document.getElementById('algo-time').innerText = hhmm;
        p1Result.innerText = `MySecret${day}${monthLetter}${hhmm}`;
    }

    // Update Phase 2
    if (document.getElementById('handshake-date')) {
        document.getElementById('handshake-date').innerText = now.toLocaleString('en-US', { month: 'long', day: 'numeric', weekday: 'long' });
        document.getElementById('handshake-weekday').innerText = weekdayInitial;
        document.getElementById('handshake-day').innerText = day;
        p2Result.innerText = `a1b2c3d4${weekdayInitial}${day}a1b2c3d4`;
    }
}
setInterval(updateLiveKey, 1000);
updateLiveKey(); // Run once immediately

// Decrypt Hover
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
document.querySelectorAll(".hacker-text").forEach(h2 => {
    h2.onmouseover = event => {
        let iteration = 0;
        const target = event.target;
        const datasetValue = target.dataset.value;
        clearInterval(target.interval);
        target.interval = setInterval(() => {
            target.innerText = target.innerText.split("").map((letter, index) => {
                if(index < iteration) return datasetValue[index];
                return letters[Math.floor(Math.random() * 26)]
            }).join("");
            if(iteration >= datasetValue.length) clearInterval(target.interval);
            iteration += 1 / 3;
        }, 30);
    }
});

// Typewriter
const taglineEl = document.getElementById('tagline');
const taglineTxt = "The Paranoid's Local Vault.";
let tagIdx = 0;
function typeTagline() {
    if (taglineEl && tagIdx < taglineTxt.length) {
        taglineEl.innerHTML += taglineTxt.charAt(tagIdx);
        tagIdx++;
        setTimeout(typeTagline, 50);
    }
}

// Terminal Typing
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const termBody = entry.target.querySelector('.terminal-body');
            const typedCmds = termBody.querySelectorAll('.typed-cmd');
            let delay = 0;

            typedCmds.forEach(span => {
                if(span.classList.contains('typed')) return;
                const text = span.dataset.type;

                setTimeout(() => {
                    span.classList.add('typed', 'typing');
                    let i = 0;
                    span.typeInterval = setInterval(() => {
                        span.innerText += text.charAt(i);
                        i++;
                        if(i >= text.length) {
                            clearInterval(span.typeInterval);
                            span.classList.remove('typing');
                        }
                    }, 20);
                }, delay);
                delay += (text.length * 20) + 400;
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.terminal-window').forEach(term => observer.observe(term));

function skipType(term) {
    term.querySelectorAll('.typed-cmd').forEach(span => {
        if(span.typeInterval) clearInterval(span.typeInterval);
        span.innerText = span.dataset.type;
        span.classList.add('typed');
        span.classList.remove('typing');
    });
}

// Glitch
const mainTitle = document.getElementById('main-title');
if (mainTitle) {
    setInterval(() => {
        if(Math.random() > 0.92) {
            mainTitle.classList.add('glitch-active');
            setTimeout(() => mainTitle.classList.remove('glitch-active'), 250);
        }
    }, 2000);
}

// 3D Tilt
const grid = document.getElementById('tilt-grid');
if(grid) {
    const cards = document.querySelectorAll('.card');
    grid.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        cards.forEach(card => {
            card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(10px)`;
        });
    });
    grid.addEventListener('mouseleave', () => {
        cards.forEach(card => card.style.transform = 'none');
    });
}

// Copy
function copyTerm(btn) {
    const body = btn.parentElement.nextElementSibling;
    const text = Array.from(body.querySelectorAll('.typed-cmd')).map(el => el.dataset.type).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerText;
        btn.innerText = "COPIED";
        btn.style.color = "#fff";
        btn.style.borderColor = "#fff";
        setTimeout(() => { btn.innerText = original; btn.style.color = ""; btn.style.borderColor = ""; }, 2000);
    });
}

// --- COUNTER LOGIC (Robust) ---
function updateCounter() {
    const counterElement = document.getElementById('view-count');
    if (!counterElement) return;

    // 1. Force Visual Change to indicate JS is running
    counterElement.innerText = "....";
    counterElement.style.color = "#666"; // Grey while loading

    const isLocal = window.location.protocol === 'file:';

    // 2. LOCAL MODE
    if (isLocal) {
        console.log("Local Mode: Using LocalStorage");
        setTimeout(() => {
            let localCount = localStorage.getItem('local_visits') || 1;
            localCount = parseInt(localCount) + 1;
            localStorage.setItem('local_visits', localCount);

            counterElement.innerText = localCount.toString().padStart(5, '0');
            counterElement.style.color = "#888"; // Grey for local
            counterElement.title = "Local File Mode";
        }, 500); // Small delay to simulate load
        return;
    }

    // 3. ONLINE MODE
    // Namespace: chronolock-ghosh-final
    fetch('https://api.counterapi.dev/v1/chronolock-ghosh-final/visits/up')
        .then(res => res.json())
        .then(data => {
            counterElement.innerText = data.count.toString().padStart(5, '0');
            counterElement.style.color = "var(--accent)"; // Green for success
        })
        .catch(err => {
            console.warn("Counter API blocked");
            // If blocked online, try to fall back to '1' or local storage
            let localCount = localStorage.getItem('local_visits') || 1;
            counterElement.innerText = localCount.toString().padStart(5, '0');
            counterElement.style.color = "#444"; // Dark grey for blocked
        });
}