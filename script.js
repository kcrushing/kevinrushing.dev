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
    col: 0, 
    rows: [] // Will be populated dynamically
};

const sections = document.querySelectorAll('.section');
const sectionTitle = document.getElementById('section-title');
const navDotsContainer = document.getElementById('nav-dots');

// Initialize
sections.forEach((sec, colIndex) => {
    // Initialize row state for this section
    state.rows.push(0);

    // Position sections horizontally (hidden by default via CSS)
    sec.style.transform = `translateX(${colIndex * 100}%)`;
    
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
        
        if (idx === state.col) {
            // Active Section
            sec.classList.add('active');
            sec.style.transform = `translateX(0) scale(1)`;
            sectionTitle.textContent = sec.dataset.title;
        } else {
            // Inactive Section
            sec.classList.remove('active');
            sec.style.transform = `translateX(${offset}%) scale(0.9)`;
        }
        
        // Update Cards for this section
        const cards = sec.querySelectorAll('.card');
        cards.forEach((card, rIdx) => {
            card.classList.remove('active', 'prev', 'next');
            if (rIdx === state.rows[idx]) card.classList.add('active');
            else if (rIdx < state.rows[idx]) card.classList.add('prev');
            else card.classList.add('next');
        });
    });

    // 2. Update Dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === state.col));
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

// --- BLASTER GAME MODE ---

document.getElementById('start-game-btn').addEventListener('click', initGame);
document.getElementById('exit-game-btn').addEventListener('click', exitGame);

let gameActive = false;
let scene, camera, renderer;
let gameCards = [];
let particles = [];
let explosions = [];
let score = 0;
let animationId;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clock = new THREE.Clock();

// Game Data
const gameData = [
    { text: "Kevin Rushing", color: "#8dc63f" },
    { text: "Senior DB Engineer", color: "#00aeff" },
    { text: "Architecture", color: "#b21dac" },
    { text: "NielsenIQ", color: "#8dc63f" },
    { text: "100M+ Records", color: "#00aeff" },
    { text: "Snowflake", color: "#ffffff" },
    { text: "Python & ML", color: "#b21dac" },
    { text: "UAMS", color: "#8dc63f" },
    { text: "Systems Design", color: "#00aeff" },
    { text: "Hire Me!", color: "#ffffff" }
];

function initGame() {
    gameActive = true;
    document.body.classList.add('game-active');
    document.getElementById('game-ui').style.display = 'block';
    
    // Setup Three.js
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'game-canvas';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '1000';
    document.body.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Create Objects
    createStarfield();
    spawnCards();

    // Event Listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onShoot);
    window.addEventListener('resize', onWindowResize);

    // Start Loop
    animateGame();
}

function exitGame() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    
    // Cleanup
    document.body.classList.remove('game-active');
    document.getElementById('game-ui').style.display = 'none';
    const canvas = document.getElementById('game-canvas');
    if (canvas) canvas.remove();
    
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('click', onShoot);
    window.removeEventListener('resize', onWindowResize);
    
    // Reset Score
    score = 0;
    document.getElementById('score').innerText = 'SCORE: 0';
}

function createTextTexture(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Card Background
    ctx.fillStyle = 'rgba(20, 30, 45, 0.9)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 236, 20);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 128);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

function spawnCards() {
    gameCards = [];
    gameData.forEach((item, index) => {
        const geometry = new THREE.PlaneGeometry(3, 1.5);
        const texture = createTextTexture(item.text, item.color);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const card = new THREE.Mesh(geometry, material);
        
        card.position.x = (Math.random() - 0.5) * 10;
        card.position.y = (Math.random() - 0.5) * 6;
        card.position.z = -20 - (index * 10); // Spaced out
        
        card.userData = {
            speed: 0.05 + Math.random() * 0.05,
            rotSpeed: { x: (Math.random()-0.5)*0.01, y: (Math.random()-0.5)*0.01 }
        };

        scene.add(card);
        gameCards.push(card);
    });
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 1000; i++) {
        vertices.push((Math.random() - 0.5) * 100);
        vertices.push((Math.random() - 0.5) * 100);
        vertices.push((Math.random() - 0.5) * 100);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
    particles.push(stars);
}

function onMouseMove(event) {
    const crosshair = document.getElementById('crosshair');
    crosshair.style.left = event.clientX + 'px';
    crosshair.style.top = event.clientY + 'px';

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onShoot() {
    if (!gameActive) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(gameCards);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        createExplosion(hitObject.position);
        scene.remove(hitObject);
        gameCards = gameCards.filter(c => c !== hitObject);
        
        score += 100;
        document.getElementById('score').innerText = 'SCORE: ' + score;

        if (gameCards.length === 0) {
            setTimeout(spawnCards, 1000);
        }
    }
}

function createExplosion(pos) {
    const geometry = new THREE.BufferGeometry();
    const count = 50;
    const positions = [];
    const velocities = [];

    for(let i=0; i<count; i++) {
        positions.push(pos.x, pos.y, pos.z);
        velocities.push(
            (Math.random()-0.5),
            (Math.random()-0.5),
            (Math.random()-0.5)
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xff4500, size: 0.2 });
    const p = new THREE.Points(geometry, material);
    p.userData = { velocities: velocities, life: 1.0 };
    scene.add(p);
    explosions.push(p);
}

function animateGame() {
    if (!gameActive) return;
    animationId = requestAnimationFrame(animateGame);
    
    const delta = clock.getDelta();

    gameCards.forEach(card => {
        card.position.z += 0.15;
        card.rotation.x += card.userData.rotSpeed.x;
        card.rotation.y += card.userData.rotSpeed.y;

        if (card.position.z > 5) {
            card.position.z = -50;
            card.position.x = (Math.random() - 0.5) * 10;
            card.position.y = (Math.random() - 0.5) * 6;
        }
    });

    for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        const positions = p.geometry.attributes.position.array;
        const velocities = p.userData.velocities;

        for(let j=0; j<velocities.length/3; j++) {
            positions[j*3] += velocities[j*3] * 0.1;
            positions[j*3+1] += velocities[j*3+1] * 0.1;
            positions[j*3+2] += velocities[j*3+2] * 0.1;
        }
        p.geometry.attributes.position.needsUpdate = true;
        p.userData.life -= 0.02;
        p.material.opacity = p.userData.life;
        p.material.transparent = true;

        if (p.userData.life <= 0) {
            scene.remove(p);
            explosions.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    if(!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
