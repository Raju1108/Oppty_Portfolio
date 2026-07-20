/* ==========================================================================
   OPPTY TECHHUB - ADVANCED ANIMATIONS ENGINE
   animations.js
   ========================================================================== */

'use strict';

/* ─────────────────────────────────────────────
   1. PARTICLES CANVAS SYSTEM
   ───────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const PARTICLE_COUNT = window.innerWidth < 768 ? 0 : 55;
  const particles = [];

  const COLORS = [
    'rgba(237, 106, 51,',
    'rgba(29, 42, 58,',
    'rgba(106, 126, 152,'
  ];

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      vx: randomBetween(-0.25, 0.25),
      vy: randomBetween(-0.25, 0.25),
      radius: randomBetween(1.5, 4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: randomBetween(0.08, 0.25),
      opacityDir: Math.random() > 0.5 ? 0.002 : -0.002,
      pulseSpeed: randomBetween(0.005, 0.015),
      pulseAngle: randomBetween(0, Math.PI * 2)
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }

  // Mouse repulsion
  let mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 140;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(237, 106, 51, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function drawParticle(p) {
    p.pulseAngle += p.pulseSpeed;
    const pulsedRadius = p.radius + Math.sin(p.pulseAngle) * 0.5;

    // Mouse repulsion
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      const force = (100 - dist) / 100;
      p.vx += (dx / dist) * force * 0.3;
      p.vy += (dy / dist) * force * 0.3;
    }

    // Friction
    p.vx *= 0.99;
    p.vy *= 0.99;

    // Speed cap
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 1.5) {
      p.vx = (p.vx / speed) * 1.5;
      p.vy = (p.vy / speed) * 1.5;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Opacity pulse
    p.opacity += p.opacityDir;
    if (p.opacity <= 0.05 || p.opacity >= 0.28) p.opacityDir *= -1;

    // Boundary wrap
    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, pulsedRadius, 0, Math.PI * 2);
    ctx.fillStyle = `${p.color}${p.opacity})`;
    ctx.fill();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    connectParticles();
    particles.forEach(drawParticle);
    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  });
})();

/* ─────────────────────────────────────────────
   2. CUSTOM CURSOR
   ───────────────────────────────────────────── */
(function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.innerWidth < 768) return;

  let ringX = 0, ringY = 0;
  let dotX = 0, dotY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Dot follows instantly
    dotX = mouseX;
    dotY = mouseY;

    // Ring lags behind
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hover effects
  const hoverTargets = document.querySelectorAll(
    'a, button, .stat-card, .service-card, .solution-card, .package-card, .engagement-card, .industry-item, .tech-badge, summary, .problem-card, .case-card, .testimonial-card'
  );

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();

/* ─────────────────────────────────────────────
   3. SCROLL ANIMATIONS (Custom AOS)
   ───────────────────────────────────────────── */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  // Get delay from attribute
  function getDelay(el) {
    const delay = el.getAttribute('data-aos-delay');
    return delay ? parseInt(delay) : 0;
  }

  // Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = getDelay(el);

        setTimeout(() => {
          el.classList.add('aos-animate');
        }, delay);

        // Only animate once
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────
   4. COUNTER ANIMATION
   ───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
})();

/* ─────────────────────────────────────────────
   5. HEADER SCROLL BEHAVIOR
   ───────────────────────────────────────────── */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
})();

/* ─────────────────────────────────────────────
   6. SCROLL TO TOP BUTTON
   ───────────────────────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ─────────────────────────────────────────────
   7. DASHBOARD CHART BARS ANIMATION
   ───────────────────────────────────────────── */
(function initChartAnimation() {
  const chartBars = document.querySelectorAll('.chart-bar');
  if (!chartBars.length) return;

  const heights = [40, 65, 80, 50, 30, 70];

  function animateBars() {
    chartBars.forEach((bar, i) => {
      const target = heights[i];
      const variance = randomBetween(-10, 10);
      const newHeight = Math.max(15, Math.min(90, target + variance));

      bar.style.transition = `height ${randomBetween(0.6, 1.2).toFixed(2)}s cubic-bezier(0.16, 1, 0.3, 1)`;
      bar.style.height = newHeight + 'px';
    });
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Animate on load
  setTimeout(animateBars, 1000);

  // Keep animating
  setInterval(animateBars, 3500);
})();

/* ─────────────────────────────────────────────
   8. MAGNETIC BUTTON EFFECT
   ───────────────────────────────────────────── */
(function initMagneticButtons() {
  if (window.innerWidth < 768) return;

  const buttons = document.querySelectorAll('.btn-primary, .btn-ghost');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const factor = 0.25;

      btn.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
    });
  });
})();

/* ─────────────────────────────────────────────
   9. STAGGERED SIDEBAR ITEM ANIMATION
   ───────────────────────────────────────────── */
(function initSidebarAnimation() {
  const items = document.querySelectorAll('.sidebar-item');
  if (!items.length) return;

  let activeIndex = 0;

  function cycleSidebar() {
    items.forEach(item => item.classList.remove('active'));

    if (activeIndex < items.length) {
      items[activeIndex].classList.add('active');
    }

    activeIndex = (activeIndex + 1) % items.length;
  }

  setInterval(cycleSidebar, 1800);
})();

/* ─────────────────────────────────────────────
   10. TEXT TYPING EFFECT (Hero Title)
   ───────────────────────────────────────────── */
(function initTypeEffect() {
  const subtitle = document.querySelector('.section-subtitle');
  if (!subtitle) return;

  // Add shimmer effect on hover for badges
  const badges = document.querySelectorAll('.badge');

  badges.forEach(badge => {
    badge.addEventListener('mouseenter', () => {
      badge.style.transition = 'all 0.3s ease';
      badge.style.letterSpacing = '0.1em';
    });

    badge.addEventListener('mouseleave', () => {
      badge.style.letterSpacing = '0.05em';
    });
  });
})();

/* ─────────────────────────────────────────────
   11. PARALLAX SCROLL EFFECT
   ───────────────────────────────────────────── */
(function initParallax() {
  if (window.innerWidth < 1024) return;

  const orbs = document.querySelectorAll('.hero-orb, .navy-orb, .cta-orb');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;

    orbs.forEach((orb, index) => {
      const speed = (index % 2 === 0) ? 0.06 : -0.04;
      const yMove = scrolled * speed;
      orb.style.transform = `translateY(${yMove}px)`;
    });
  }, { passive: true });
})();

/* ─────────────────────────────────────────────
   12. HERO GRID MOUSE PARALLAX
   ───────────────────────────────────────────── */
(function initMouseParallax() {
  if (window.innerWidth < 1024) return;

  const dashboard = document.getElementById('mockup-dashboard');
  if (!dashboard) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    targetX = (e.clientX - centerX) / centerX * 8;
    targetY = (e.clientY - centerY) / centerY * 4;
  });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    dashboard.style.transform = `
      translateY(calc(-50% + ${currentY}px)) 
      rotateY(${currentX * 0.5}deg) 
      rotateX(${-currentY * 0.3}deg)
    `;

    requestAnimationFrame(animateParallax);
  }

  // Only apply when hero is visible
  const hero = document.getElementById('hero-section');
  const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      dashboard.style.transform = '';
      document.addEventListener('mousemove', trackMouse);
    } else {
      document.removeEventListener('mousemove', trackMouse);
    }
  });

  function trackMouse(e) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    targetX = (e.clientX - centerX) / centerX * 8;
    targetY = (e.clientY - centerY) / centerY * 4;
  }

  if (hero) heroObserver.observe(hero);
})();

/* ─────────────────────────────────────────────
   13. SMOOTH SECTION REVEAL WITH LINE DRAWING
   ───────────────────────────────────────────── */
(function initSectionReveal() {
  const sections = document.querySelectorAll('section');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(section => sectionObserver.observe(section));
})();

/* ─────────────────────────────────────────────
   14. FLOATING BADGES INTERACTIVE
   ───────────────────────────────────────────── */
(function initFloatingBadges() {
  const badges = document.querySelectorAll('.hero-float-badge');

  badges.forEach(badge => {
    badge.addEventListener('mouseenter', () => {
      badge.style.animationPlayState = 'paused';
      badge.style.transform = 'scale(1.08)';
      badge.style.transition = 'transform 0.3s ease';
      badge.style.zIndex = '10';
    });

    badge.addEventListener('mouseleave', () => {
      badge.style.animationPlayState = 'running';
      badge.style.transform = '';
      badge.style.zIndex = '';
    });
  });
})();

/* ─────────────────────────────────────────────
   15. CARD TILT 3D EFFECT
   ───────────────────────────────────────────── */
(function initCardTilt() {
  if (window.innerWidth < 768) return;

  const tiltCards = document.querySelectorAll('.stat-card, .package-card, .testimonial-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -4;
      const rotateY = (x - centerX) / centerX * 4;

      card.style.transition = 'transform 0.1s ease';
      card.style.transform = `
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-4px)
        scale(1.01)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });
})();

/* ─────────────────────────────────────────────
   16. TECH BADGE STAGGER ON HOVER
   ───────────────────────────────────────────── */
(function initTechBadgeStagger() {
  const techCards = document.querySelectorAll('.tech-card');

  techCards.forEach(card => {
    const badges = card.querySelectorAll('.tech-badge');

    card.addEventListener('mouseenter', () => {
      badges.forEach((badge, index) => {
        setTimeout(() => {
          badge.style.transform = 'translateY(-3px)';
          badge.style.transition = `all 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s`;
        }, 0);
      });
    });

    card.addEventListener('mouseleave', () => {
      badges.forEach(badge => {
        badge.style.transform = '';
      });
    });
  });
})();

/* ─────────────────────────────────────────────
   17. SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ───────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.getElementById('site-header')?.offsetHeight || 72;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });
})();

/* ─────────────────────────────────────────────
   18. GLOWING PROCESS NODE ON SCROLL
   ───────────────────────────────────────────── */
(function initProcessGlow() {
  const processNodes = document.querySelectorAll('.process-node');
  if (!processNodes.length) return;

  let currentGlow = 0;

  function glowNext() {
    processNodes.forEach(node => {
      node.style.boxShadow = '';
      node.style.borderColor = '';
    });

    const node = processNodes[currentGlow];
    node.style.borderColor = 'var(--primary-orange)';
    node.style.boxShadow = '0 0 0 8px rgba(237, 106, 51, 0.1)';
    node.style.transition = 'all 0.5s ease';

    currentGlow = (currentGlow + 1) % processNodes.length;
  }

  const processSection = document.getElementById('process-section');
  if (!processSection) return;

  const processObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const interval = setInterval(glowNext, 700);
      setTimeout(() => {
        clearInterval(interval);
        processNodes.forEach(node => {
          node.style.boxShadow = '';
          node.style.borderColor = '';
        });
      }, processNodes.length * 750);
    }
  }, { threshold: 0.3 });

  processObserver.observe(processSection);
})();

/* ─────────────────────────────────────────────
   19. RIPPLE EFFECT ON CLICK
   ───────────────────────────────────────────── */
(function initRipple() {
  const rippleTargets = document.querySelectorAll('.btn-primary, .btn-ghost, .service-card, .engagement-card');

  rippleTargets.forEach(el => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(237, 106, 51, 0.15);
        width: 10px;
        height: 10px;
        left: ${x - 5}px;
        top: ${y - 5}px;
        transform: scale(0);
        animation: rippleExpand 0.6s linear;
        pointer-events: none;
        z-index: 100;
      `;

      el.appendChild(ripple);

      // Add keyframe dynamically if not present
      if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
          @keyframes rippleExpand {
            to { transform: scale(40); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => ripple.remove(), 600);
    });
  });
})();

/* ─────────────────────────────────────────────
   20. INIT COMPLETE LOG
   ───────────────────────────────────────────── */
console.log('%c🚀 Oppty TechHub | Animation Engine v1.0 Loaded', 
  'color: #ED6A33; font-weight: bold; font-size: 14px; padding: 4px;'
);