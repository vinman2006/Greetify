// Greetify Animation System
const initAnimations = () => {
    // 1. Hero entrance
    gsap.from('#hero-title', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('#node-counter', { y: 10, opacity: 0, duration: 0.7, delay: 0.3 });
    gsap.from('#stats-bar', { y: 14, opacity: 0, duration: 0.7, delay: 0.5 });

    // 2. Pulse dot — subtle, not distracting
    gsap.to('#pulse-dot', {
        scale: 1.4, opacity: 0.4, duration: 1.4,
        repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    // 3. Nav telemetry cycle
    const statusEl = document.getElementById('typewriter-nav');
    const msgs = ['REGISTRY LIVE', 'ATLAS CONNECTED', 'DATA VERIFIED'];
    let i = 0;
    setInterval(() => {
        if (!statusEl || statusEl.textContent === 'OFFLINE') return;
        gsap.to(statusEl, {
            opacity: 0, y: -4, duration: 0.3,
            onComplete: () => {
                i = (i + 1) % msgs.length;
                statusEl.textContent = msgs[i];
                gsap.to(statusEl, { opacity: 0.8, y: 0, duration: 0.3 });
            }
        });
    }, 5000);

    // 4. Stat numbers count up
    setTimeout(() => {
        ['stat-total','stat-today','stat-upcoming','stat-missed'].forEach(id => {
            const el = document.getElementById(id);
            if (!el || el.textContent === '—') return;
            const target = parseInt(el.textContent, 10);
            if (!isNaN(target)) {
                gsap.from(el, { textContent: 0, duration: 1, ease: 'power2.out', snap: { textContent: 1 },
                    onUpdate: function() { el.textContent = Math.round(this.targets()[0]._gsap.get('textContent')); }
                });
            }
        });
    }, 700);
};

// Card fade-up stagger
const animateCardEntrance = (element, index) => {
    gsap.from(element, {
        y: 22, opacity: 0, duration: 0.55,
        delay: index * 0.045,
        ease: 'power2.out'
    });
};

document.addEventListener('DOMContentLoaded', initAnimations);
