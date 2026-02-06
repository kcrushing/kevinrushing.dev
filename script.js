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
    const duration = 2000; // ms
    const increment = target / (duration / 16); // 60fps
    
    let current = 0;
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.innerText = Math.ceil(current) + (target > 1000 ? 'K' : 'M+'); // Custom suffix logic
            if (target === 100) counter.innerText = Math.ceil(current) + 'M+';
            requestAnimationFrame(updateCounter);
        } else {
            counter.innerText = target + 'M+';
        }
    };
    updateCounter();
});

// Tilt Effect (Desktop Only)
if (window.matchMedia("(min-width: 1024px)").matches) {
    document.addEventListener('mousemove', (e) => {
        const modules = document.querySelectorAll('.module');
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        modules.forEach(mod => {
            mod.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
        });
    });
}
