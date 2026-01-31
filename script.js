// Canvas Background (Simplified for Mobile Performance)
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
const colors = ['#8dc63f', '#00aeff', '#b21dac'];

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const count = window.innerWidth < 768 ? 25 : 50; // Fewer particles on mobile
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Connections
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - dist/100)})`;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateCanvas();


// --- SWIPE LOGIC ---

const state = {
    col: 0, // Current Section (Horizontal)
    rows: [0, 0, 0] // Current Card index for each section (Vertical)
};

const sections = document.querySelectorAll('.section');
const sectionTitle = document.getElementById('section-title');
const navDotsContainer = document.getElementById('nav-dots');
const tutorial = document.getElementById('tutorial');

// Initialize
sections.forEach((sec, colIndex) => {
    // Position sections horizontally
    sec.style.left = `${colIndex * 100}%`;
    
    // Setup cards inside
    const cards = sec.querySelectorAll('.card');
    cards.forEach((card, rowIndex) => {
        if (rowIndex === 0) card.classList.add('active');
        else card.classList.add('next');
    });

    // Create Nav Dot
    const dot = document.createElement('div');
    dot.classList.add('nav-dot');
    if (colIndex === 0) dot.classList.add('active');
    navDotsContainer.appendChild(dot);
});

function updateView() {
    // 1. Move Sections (Horizontal)
    sections.forEach((sec, idx) => {
        const offset = (idx - state.col) * 100;
        sec.style.transform = `translateX(${offset}%) scale(${idx === state.col ? 1 : 0.9})`;
        sec.style.opacity = idx === state.col ? 1 : 0.3;
        
        if (idx === state.col) {
            sectionTitle.textContent = sec.dataset.title;
            // Update Active Card in this section
            const cards = sec.querySelectorAll('.card');
            cards.forEach((card, rIdx) => {
                card.className = 'card'; // Reset
                if (rIdx === state.rows[state.col]) card.classList.add('active');
                else if (rIdx < state.rows[state.col]) card.classList.add('prev');
                else card.classList.add('next');
            });
        }
    });

    // 2. Update Dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === state.col));

    // 3. Hide Tutorial after first move
    if (state.col > 0 || state.rows[0] > 0) {
        tutorial.style.opacity = '0';
    }
}

// Touch Handling
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: false});

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, {passive: false});

// Mouse Handling for Desktop Testing
document.addEventListener('mousedown', e => {
    touchStartX = e.clientX;
    touchStartY = e.clientY;
});
document.addEventListener('mouseup', e => {
    handleSwipe(touchStartX, touchStartY, e.clientX, e.clientY);
});

// Keyboard Navigation
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') moveHorizontal(1);
    if (e.key === 'ArrowLeft') moveHorizontal(-1);
    if (e.key === 'ArrowDown') moveVertical(1);
    if (e.key === 'ArrowUp') moveVertical(-1);
});

function handleSwipe(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 50) return; // Tap, ignore

    if (absDx > absDy) {
        // Horizontal Swipe
        if (dx > 0) moveHorizontal(-1); // Swipe Right -> Go Left
        else moveHorizontal(1);         // Swipe Left -> Go Right
    } else {
        // Vertical Swipe
        if (dy > 0) moveVertical(-1);   // Swipe Down -> Go Up (Prev Card)
        else moveVertical(1);           // Swipe Up -> Go Down (Next Card)
    }
}

function moveHorizontal(dir) {
    const nextCol = state.col + dir;
    if (nextCol >= 0 && nextCol < sections.length) {
        state.col = nextCol;
        updateView();
    }
}

function moveVertical(dir) {
    const currentSection = sections[state.col];
    const cardCount = currentSection.querySelectorAll('.card').length;
    const nextRow = state.rows[state.col] + dir;

    if (nextRow >= 0 && nextRow < cardCount) {
        state.rows[state.col] = nextRow;
        updateView();
    }
}

// Initial Render
updateView();
