/**
 * LUZ & FÉ — SCRIPT PRINCIPAL
 * Animação de Crucifixo Controlada por Scroll, Acessibilidade e Interatividade
 */

(function () {
  'use strict';

  // 1. SELETORES PRINCIPAIS
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const sections = document.querySelectorAll('section[id], footer[id]');
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  const prayerDialog = document.getElementById('prayer-dialog');
  const openPrayerBtns = document.querySelectorAll('.btn-open-prayer');
  const closePrayerBtns = document.querySelectorAll('.btn-close-prayer');
  const particlesCanvas = document.getElementById('particles-canvas');

  // Elementos da Jornada Controlada por Scroll
  const faithJourney = document.getElementById('jornada');
  const stickyWrapper = document.querySelector('.journey-sticky-wrapper');
  const crucifixLight = document.getElementById('crucifix-light');
  const crucifixGlow = document.getElementById('crucifix-glow');
  const journeyProgressBar = document.getElementById('journey-progress-bar');
  const journeyPct = document.getElementById('journey-pct');
  const stageNumber = document.getElementById('stage-number');
  const stageTheme = document.getElementById('stage-theme');
  const stages = document.querySelectorAll('.journey-stage');

  // Detecta preferência por redução de movimento
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 2. HEADER DINÂMICO NO SCROLL
  // --------------------------------------------------------------------------
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }

  // --------------------------------------------------------------------------
  // 3. ANIMAÇÃO DO CRUCIFIXO CONTROLADA PELO SCROLL (0% A 100%)
  // --------------------------------------------------------------------------
  function updateJourneyProgress() {
    if (!faithJourney || !stickyWrapper || prefersReducedMotion) return;

    const sectionRect = faithJourney.getBoundingClientRect();
    const wrapperRect = stickyWrapper.getBoundingClientRect();

    const stickyTop = wrapperRect.top;
    const totalScrollable = faithJourney.offsetHeight - stickyWrapper.offsetHeight;

    if (totalScrollable <= 0) return;

    // Distância percorrida dentro da seção sticky
    const scrolled = -sectionRect.top + stickyTop;
    const rawProgress = scrolled / totalScrollable;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // 1. Controla a opacidade da imagem final iluminada diretamente pelo scroll
    if (crucifixLight) {
      crucifixLight.style.opacity = progress.toFixed(4);
    }

    // 2. Controla o halo celestial ao redor do crucifixo
    if (crucifixGlow) {
      crucifixGlow.style.opacity = (progress * 0.9).toFixed(4);
    }

    // 3. Atualiza a barra de progresso visual
    if (journeyProgressBar) {
      journeyProgressBar.style.width = (progress * 100).toFixed(1) + '%';
    }
    if (journeyPct) {
      journeyPct.textContent = Math.round(progress * 100) + '%';
    }

    // 4. Alterna as 5 etapas da narrativa
    let currentStage = 1;
    let themeText = 'TREVAS';

    if (progress < 0.20) {
      currentStage = 1;
      themeText = 'TREVAS';
    } else if (progress < 0.40) {
      currentStage = 2;
      themeText = 'A LUZ SURGE';
    } else if (progress < 0.60) {
      currentStage = 3;
      themeText = 'FÉ';
    } else if (progress < 0.80) {
      currentStage = 4;
      themeText = 'ESPERANÇA';
    } else {
      currentStage = 5;
      themeText = 'A LUZ VENCE';
    }

    if (stageNumber && stageNumber.textContent !== String(currentStage)) {
      stageNumber.textContent = String(currentStage);
    }
    if (stageTheme && stageTheme.textContent !== themeText) {
      stageTheme.textContent = themeText;
    }

    stages.forEach((st) => {
      const idx = parseInt(st.getAttribute('data-stage'), 10);
      if (idx === currentStage) {
        if (!st.classList.contains('active')) {
          st.classList.add('active');
        }
      } else {
        if (st.classList.contains('active')) {
          st.classList.remove('active');
        }
      }
    });
  }

  // Otimização de Scroll via requestAnimationFrame
  let isTicking = false;
  function onScroll() {
    handleHeaderScroll();

    if (!isTicking) {
      requestAnimationFrame(() => {
        updateJourneyProgress();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Executa uma vez na inicialização
  onScroll();

  // --------------------------------------------------------------------------
  // 4. MENU MOBILE ACESSÍVEL
  // --------------------------------------------------------------------------
  function toggleMobileMenu(forceClose = false) {
    if (!menuToggle || !mobileDrawer) return;

    const isOpen = forceClose ? false : menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstLink = mobileDrawer.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      menuToggle.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleMobileMenu());
  }

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
        toggleMobileMenu(true);
      }
      if (prayerDialog && prayerDialog.open) {
        prayerDialog.close();
      }
    }
  });

  // --------------------------------------------------------------------------
  // 5. SCROLL SPY & NAVEGAÇÃO SUAVE
  // --------------------------------------------------------------------------
  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach((sec) => navObserver.observe(sec));

  // --------------------------------------------------------------------------
  // 6. REVEAL CINEMATOGRÁFICO ON SCROLL
  // --------------------------------------------------------------------------
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-revealed'));
  }

  // --------------------------------------------------------------------------
  // 7. PARTICULAS DISCRETAS E CONTEMPLATIVAS (SEÇÃO REFLEXÃO)
  // --------------------------------------------------------------------------
  if (particlesCanvas && !prefersReducedMotion) {
    const ctx = particlesCanvas.getContext('2d');
    let animationFrameId;
    let isCanvasVisible = false;
    let width = (particlesCanvas.width = particlesCanvas.offsetWidth);
    let height = (particlesCanvas.height = particlesCanvas.offsetHeight);

    const particleCount = window.innerWidth < 768 ? 25 : 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        isGold: Math.random() > 0.4
      });
    }

    function resizeCanvas() {
      if (!particlesCanvas) return;
      width = particlesCanvas.width = particlesCanvas.offsetWidth;
      height = particlesCanvas.height = particlesCanvas.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });

    function renderParticles() {
      if (!isCanvasVisible) return;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const clampedAlpha = Math.max(0.08, Math.min(0.65, p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isGold
          ? `rgba(214, 181, 106, ${clampedAlpha})`
          : `rgba(255, 255, 255, ${clampedAlpha * 0.8})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.isGold ? 'rgba(214, 181, 106, 0.6)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderParticles);
    }

    const reflectionSection = document.getElementById('reflexao');
    if (reflectionSection && 'IntersectionObserver' in window) {
      const canvasObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isCanvasVisible = entry.isIntersecting;
            if (isCanvasVisible) {
              renderParticles();
            } else {
              cancelAnimationFrame(animationFrameId);
            }
          });
        },
        { threshold: 0.1 }
      );
      canvasObserver.observe(reflectionSection);
    } else {
      isCanvasVisible = true;
      renderParticles();
    }
  }

  // --------------------------------------------------------------------------
  // 8. MODAL DE ORAÇÃO & ESPERANÇA
  // --------------------------------------------------------------------------
  if (prayerDialog) {
    openPrayerBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prayerDialog.showModal();
      });
    });

    closePrayerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        prayerDialog.close();
      });
    });

    prayerDialog.addEventListener('click', (e) => {
      const rect = prayerDialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        prayerDialog.close();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. RETORNO AO TOPO
  // --------------------------------------------------------------------------
  const backToTopBtn = document.querySelector('.btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }
})();
