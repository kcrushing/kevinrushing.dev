// Clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('clock').innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// Animate Skill Bars on Load
setTimeout(() => {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0'; // Reset
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}, 500);

// Counter Animation for Stats
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const increment = target / (duration / 16); // 60fps

    let current = 0;
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.innerText = Math.ceil(current) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            counter.innerText = target + suffix;
        }
    };
    updateCounter();
});

// Tilt Effect (Desktop Only - hover capable devices)
if (window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) {
    let rafId = null;
    let lastX = 0, lastY = 0;

    document.addEventListener('mousemove', (e) => {
        lastX = (e.clientX / window.innerWidth - 0.5) * 20;
        lastY = (e.clientY / window.innerHeight - 0.5) * 20;

        if (rafId) return;

        rafId = requestAnimationFrame(() => {
            const modules = document.querySelectorAll('.module');
            modules.forEach(mod => {
                mod.style.transform = `translate(${lastX * 0.5}px, ${lastY * 0.5}px)`;
            });
            rafId = null;
        });
    });
}

// Mobile: Add active states for touch interactions
if ('ontouchstart' in window) {
    const interactiveElements = document.querySelectorAll('.btn, .icon-box, .module');

    interactiveElements.forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        }, { passive: true });

        el.addEventListener('touchend', function() {
            this.style.opacity = '1';
        }, { passive: true });

        el.addEventListener('touchcancel', function() {
            this.style.opacity = '1';
        }, { passive: true });
    });
}

// Optimize animations for mobile
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Only run expensive animations on desktop
if (!isMobile && !prefersReducedMotion) {
    // Skill bar animations are already present, just ensure they run
    // Counter animations are already present
} else if (prefersReducedMotion) {
    // Disable animations for accessibility
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
        bar.style.transition = 'none';
    });
}

// Prevent zoom on double-tap for buttons (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        if (e.target.closest('.btn, .module')) {
            e.preventDefault();
        }
    }
    lastTouchEnd = now;
}, { passive: false });

// Add viewport height fix for mobile browsers (address bar issue)
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(setVH, 100);
});

// Optimize scroll performance on mobile
if (isMobile) {
    document.addEventListener('scroll', () => {
        // Debounced scroll handling if needed in future
    }, { passive: true });
}
