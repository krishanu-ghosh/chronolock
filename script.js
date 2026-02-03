    // --- 1. Boot Sequence ---
    const bootLines = document.querySelectorAll('.boot-line');
    const bootScreen = document.getElementById('boot-screen');

    function runBoot() {
    let delay = 0;
    bootLines.forEach((line, index) => {
    setTimeout(() => {
    line.classList.add('boot-active');
}, delay);
    delay += Math.random() * 300 + 100;
});

    // Hide boot screen
    setTimeout(() => {
    bootScreen.style.opacity = '0';
    bootScreen.style.pointerEvents = 'none';
}, delay + 800);
}

    window.onload = () => {
    runBoot();
    typeTagline();
};

    // --- 2. Custom Cursor with Pulse ---
    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
    // Click Pulse Effect
    document.addEventListener('mousedown', () => {
    cursor.classList.add('pulse');
    setTimeout(() => cursor.classList.remove('pulse'), 200);
});

    // Add hover effect on interactive elements
    const clickables = document.querySelectorAll('a, button, .card, .terminal-window');
    clickables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.width = '50px';
        cursor.style.height = '50px';
        cursor.style.background = 'rgba(0, 255, 65, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.background = 'transparent';
});
});

    // --- 3. Matrix Rain (Hexadecimal) ---
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水' +
    '玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞' +
    '陶唐吊民伐罪周发商汤坐朝问道垂拱平章爱育黎首臣伏戎羌遐迩一体率宾归王鸣凤在竹白驹食场化被草木赖及万方盖'; // Changed to Hex
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

    // --- 4. Live Algorithm Logic ---
    function updateLiveKey() {
    const now = new Date();

    // --- SHARED VARIABLES ---
    const day = now.getDate();
    const monthLetter = now.toLocaleString('en-US', { month: 'narrow' }).toLowerCase()[0];
    const hhmm = now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0');
    const weekdayInitial = now.toLocaleString('en-US', { weekday: 'narrow' }).toLowerCase();
    const friendlyFullDate = now.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
});

    // --- UPDATE PHASE 1 (Time Algorithm) ---
    const p1Date = document.getElementById('algo-friendly-date');
    const p1Day = document.getElementById('algo-day');
    const p1Month = document.getElementById('algo-month');
    const p1Time = document.getElementById('algo-time');
    const p1Result = document.getElementById('algo-result');

    if(p1Date) p1Date.innerText = now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    if(p1Day) p1Day.innerText = day;
    if(p1Month) p1Month.innerText = monthLetter;
    if(p1Time) p1Time.innerText = hhmm;
    if(p1Result) p1Result.innerText = `MySecret${day}${monthLetter}${hhmm}`;

    // --- UPDATE PHASE 2 (Hex + Weekday + Day + Hex) ---
    const p2Date = document.getElementById('handshake-date');
    const p2Weekday = document.getElementById('handshake-weekday');
    const p2Day = document.getElementById('handshake-day');
    const p2Result = document.getElementById('handshake-result');

    if(p2Date) p2Date.innerText = friendlyFullDate;
    if(p2Weekday) p2Weekday.innerText = weekdayInitial;
    if(p2Day) p2Day.innerText = day;

    // NEW LOGIC HERE:
    if(p2Result) p2Result.innerText = `a1b2c3d4${weekdayInitial}${day}a1b2c3d4`;
}
    setInterval(updateLiveKey, 1000);
    updateLiveKey();

    // --- 5. Decrypt Hover ---
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

    // --- 6. Typewriter Tagline ---
    const taglineTxt = "The Paranoid's Local Vault.";
    const taglineEl = document.getElementById('tagline');
    let tagIdx = 0;
    function typeTagline() {
    if (tagIdx < taglineTxt.length) {
    taglineEl.innerHTML += taglineTxt.charAt(tagIdx);
    tagIdx++;
    setTimeout(typeTagline, 50);
}
}

    // --- 7. Terminal Typing & Skip ---
    const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const termBody = entry.target.querySelector('.terminal-body');
            const typedCmds = termBody.querySelectorAll('.typed-cmd');
            let delay = 0;

            typedCmds.forEach(span => {
                const text = span.dataset.type;
                if(span.classList.contains('typed')) return;

                setTimeout(() => {
                    span.classList.add('typed');
                    span.classList.add('typing'); // Adds blinking cursor

                    let i = 0;
                    span.typeInterval = setInterval(() => {
                        span.innerText += text.charAt(i);
                        i++;
                        if(i >= text.length) {
                            clearInterval(span.typeInterval);
                            span.classList.remove('typing'); // Stop blinking when done
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

    // Skip Typing Function
    function skipType(term) {
    term.querySelectorAll('.typed-cmd').forEach(span => {
        if(span.typeInterval) clearInterval(span.typeInterval);
        span.innerText = span.dataset.type;
        span.classList.add('typed');
        span.classList.remove('typing');
    });
}

    // --- 8. Glitch Effect Trigger ---
    const mainTitle = document.getElementById('main-title');
    setInterval(() => {
    if(Math.random() > 0.92) { // Random chance to glitch
    mainTitle.classList.add('glitch-active');
    setTimeout(() => mainTitle.classList.remove('glitch-active'), 250);
}
}, 2000);

    // --- 9. 3D Tilt ---
    const grid = document.getElementById('tilt-grid');
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

    // --- 10. Copy Function ---
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

    // --- 11. View Counter Logic ---
    function updateCounter() {
    const counterElement = document.getElementById('view-count');

    // Use a unique namespace to avoid collision (resetting to 0)
    // I changed 'demo' to 'live-v2' to force a fresh count for you
    const namespace = 'chronolock-live-v2';
    const key = 'visits';

    fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
    .then(res => {
    if (!res.ok) throw new Error("API Blocked");
    return res.json();
})
    .then(data => {
    const count = data.count.toString().padStart(5, '0');
    if(counterElement) counterElement.innerText = count;
})
    .catch(err => {
    // FALLBACK: If API is blocked (AdBlock/Offline), use LocalStorage
    console.warn('Counter API blocked. Switching to local storage.');
    let localCount = localStorage.getItem('local_visits') || 0;
    localCount++;
    localStorage.setItem('local_visits', localCount);
    if(counterElement) {
    counterElement.innerText = localCount.toString().padStart(5, '0');
    counterElement.style.color = '#888'; // Grey out to indicate offline/local mode
    counterElement.title = "Offline Mode (Local Only)";
}
});
}
