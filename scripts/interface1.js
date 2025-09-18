const SLIDES = [
  {
    title: "Gerald E. Villarias",
    icon: "🚀",
    desc: "CEO of 'The 4DCoders'"
  },
  {
    title: "Shasli Bansi",
    icon: "🌌",
    desc: "COO of 'The 4DCoders'"
  },
  {
    title: "Mathias Jayobo",
    icon: "🛸",
    desc: "CFO of 'The 4DCoders'"
  },
  {
    title: "Herald Garino",
    icon: "⭐",
    desc: "CMO of 'The 4DCoders'"
  },
  { title: "Chris Imman", icon: "🌍", desc: "CTO of 'The 4DCoders'" }
];

// Utility: Easing Functions
const EASING = {
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  cubic: (t) => --t * t * t + 1,
  elastic: (t) =>
    Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * 2 * Math.PI) / 0.3) + 1
};

// StellarNavigator Class
class StellarNavigator {
  constructor(slides, carouselEl, dotNavEl, controls) {
    this.slides = slides;
    this.carouselEl = carouselEl;
    this.dotNavEl = dotNavEl;
    this.controls = controls;
    this.slideCount = slides.length;
    this.activeIdx = 0;
    this.radius = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--carousel-radius"
      )
    );
    this.angleStep = 360 / this.slideCount;
    this.animating = false;
    this.speed = "normal";
    this.autoplay = false;
    this.shuffle = false;
    this.timer = null;
    this.init();
  }
  init() {
    this.renderSlides();
    this.renderDots();
    this.attachEvents();
    this.update();
  }
  renderSlides() {
    this.carouselEl.innerHTML = "";
    this.slideEls = [];
    for (let i = 0; i < this.slideCount; i++) {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      slide.setAttribute("tabindex", "0");
      slide.setAttribute("role", "group");
      slide.setAttribute(
        "aria-label",
        `${this.slides[i].title}: ${this.slides[i].desc}`
      );
      slide.innerHTML = `
            <span class="slide-icon">${this.slides[i].icon}</span>
            <span class="slide-title">${this.slides[i].title}</span>
            <span class="slide-desc">${this.slides[i].desc}</span>
          `;
      this.carouselEl.appendChild(slide);
      this.slideEls.push(slide);
    }
  }
  renderDots() {
    this.dotNavEl.innerHTML = "";
    this.dotEls = [];
    for (let i = 0; i < this.slideCount; i++) {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.setAttribute(
        "aria-label",
        `Go to slide ${i + 1}: ${this.slides[i].title}`
      );
      dot.setAttribute("tabindex", "0");
      dot.addEventListener("click", () => this.goTo(i));
      this.dotNavEl.appendChild(dot);
      this.dotEls.push(dot);
    }
  }
  attachEvents() {
    this.controls.prev.addEventListener("click", () => this.prev());
    this.controls.next.addEventListener("click", () => this.next());
    document.addEventListener("keydown", (e) => this.handleKey(e));
    this.carouselEl.addEventListener("wheel", (e) => this.handleWheel(e));
    this.carouselEl.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: true }
    );
    this.carouselEl.addEventListener(
      "touchmove",
      (e) => this.handleTouchMove(e),
      { passive: true }
    );
    this.carouselEl.addEventListener("touchend", (e) => this.handleTouchEnd(e));
    this.carouselEl.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e)
    );
    window.addEventListener("resize", () => this.update());
  }
  update() {
    this.angleStep = 360 / this.slideCount;
    this.radius = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--carousel-radius"
      )
    );
    for (let i = 0; i < this.slideCount; i++) {
      const angle = ((i - this.activeIdx) * this.angleStep * Math.PI) / 180;
      const x = Math.sin(angle) * this.radius;
      const z = Math.cos(angle) * this.radius;
      this.slideEls[i].style.transform = `
            translateX(${x}px)
            translateZ(${z}px)
            rotateY(${(i - this.activeIdx) * this.angleStep}deg)
          `;
      this.slideEls[i].classList.toggle("active", i === this.activeIdx);
      this.slideEls[i].setAttribute("aria-hidden", i !== this.activeIdx);
    }
    for (let i = 0; i < this.dotEls.length; i++) {
      this.dotEls[i].classList.toggle("active", i === this.activeIdx);
    }
  }
  goTo(idx) {
    if (this.animating || idx === this.activeIdx) return;
    this.activeIdx = idx;
    this.update();
    AudioManager.playNav();
  }
  next() {
    this.goTo((this.activeIdx + 1) % this.slideCount);
  }
  prev() {
    this.goTo((this.activeIdx - 1 + this.slideCount) % this.slideCount);
  }
  handleKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowRight":
        this.next();
        break;
      case "ArrowLeft":
        this.prev();
        break;
      case "Home":
        this.goTo(0);
        break;
      case "End":
        this.goTo(this.slideCount - 1);
        break;
      case " ":
        this.toggleAutoplay();
        break;
    }
  }
  handleWheel(e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      if (e.deltaY > 0) this.next();
      else this.prev();
    }
  }
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.touchMoved = false;
  }
  handleTouchMove(e) {
    this.touchMoved = true;
    this.touchEndX = e.touches[0].clientX;
    this.touchEndY = e.touches[0].clientY;
  }
  handleTouchEnd(e) {
    if (!this.touchMoved) return;
    const dx = this.touchEndX - this.touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx > 0) this.prev();
      else this.next();
    }
  }
  handleMouseDown(e) {
    if (e.button !== 0) return;
    this.dragStartX = e.clientX;
    this.dragging = true;
    document.addEventListener(
      "mousemove",
      (this.handleMouseMoveBound = this.handleMouseMove.bind(this))
    );
    document.addEventListener(
      "mouseup",
      (this.handleMouseUpBound = this.handleMouseUp.bind(this))
    );
  }
  handleMouseMove(e) {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX;
    if (Math.abs(dx) > 32) {
      if (dx > 0) this.prev();
      else this.next();
      this.dragging = false;
    }
  }
  handleMouseUp(e) {
    this.dragging = false;
    document.removeEventListener("mousemove", this.handleMouseMoveBound);
    document.removeEventListener("mouseup", this.handleMouseUpBound);
  }
  toggleAutoplay() {
    this.autoplay = !this.autoplay;
    if (this.autoplay) {
      this.timer = setInterval(() => this.next(), this.getSpeed());
    } else {
      clearInterval(this.timer);
    }
  }
  getSpeed() {
    switch (this.speed) {
      case "slow":
        return 3200;
      case "fast":
        return 1200;
      default:
        return 2000;
    }
  }
  setSpeed(speed) {
    this.speed = speed;
    if (this.autoplay) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.next(), this.getSpeed());
    }
  }
  shuffleSlides() {
    this.slides = this.slides.sort(() => Math.random() - 0.5);
    this.renderSlides();
    this.renderDots();
    this.update();
  }
  reset() {
    this.activeIdx = 0;
    this.update();
  }
}

// EffectsManager Class
class EffectsManager {
  static initStarfield(canvas, layers = 3) {
    const ctx = canvas.getContext("2d");
    let stars = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (let l = 0; l < layers; l++) {
        for (let i = 0; i < 80 + l * 40; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: l + 1,
            r: Math.random() * (1.2 + l * 0.6),
            alpha: 0.5 + Math.random() * 0.5
          });
        }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = s.z === 1 ? "#fff" : s.z === 2 ? "#ffd700" : "#6c3fd1";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8 * s.z;
        ctx.fill();
        ctx.restore();
      }
    }
    function animate() {
      draw();
      requestAnimationFrame(animate);
    }
    window.addEventListener("resize", resize);
    resize();
    animate();
  }
  static initParticles(canvas, count = 48) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          r: 2 + Math.random() * 3,
          color: `rgba(108,63,209,${0.5 + Math.random() * 0.5})`
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
    }
    function animate() {
      draw();
      requestAnimationFrame(animate);
    }
    window.addEventListener("resize", resize);
    resize();
    animate();
  }
  static initCursor(cursorEl) {
    document.addEventListener("mousemove", (e) => {
      cursorEl.style.transform = `translate(${e.clientX - 16}px,${
        e.clientY - 16
      }px) scale(1)`;
      cursorEl.style.opacity = "0.8";
    });
    document.addEventListener("mousedown", () => {
      cursorEl.style.transform += " scale(0.7)";
      cursorEl.style.opacity = "0.5";
    });
    document.addEventListener("mouseup", () => {
      cursorEl.style.transform = cursorEl.style.transform.replace(
        " scale(0.7)",
        " scale(1)"
      );
      cursorEl.style.opacity = "0.8";
    });
  }
  static parallax(container) {
    container.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 32;
      const y = (e.clientY / window.innerHeight - 0.5) * 32;
      container.style.transform = `translate(${x}px,${y}px)`;
    });
    container.addEventListener("mouseleave", () => {
      container.style.transform = "";
    });
  }
}

// Loading Screen Logic
function hideLoading() {
  document.getElementById("loading-screen").style.opacity = "0";
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
  }, 700);
}
function showLoadingProgress(percent) {
  document.getElementById("loading-bar").style.width = percent + "%";
  document.getElementById(
    "loading-text"
  ).textContent = `Loading assets... ${percent}%`;
}

// Theme Switcher
function switchTheme() {
  const dark = document.body.classList.toggle("dark-theme");
  if (dark) {
    document.body.style.background =
      "linear-gradient(135deg,#1a1a2f 0%,#3f2fd1 100%)";
    document.getElementById("theme-switcher").textContent = "☀️";
  } else {
    document.body.style.background = "var(--gradient)";
    document.getElementById("theme-switcher").textContent = "🌙";
  }
}

// Main Initialization
window.addEventListener("DOMContentLoaded", () => {
  // Loading Progress Simulation
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      hideLoading();
      setTimeout(initApp, 400);
    }
    showLoadingProgress(Math.floor(progress));
  }, 180);

  function initApp() {
    // Effects
    EffectsManager.initStarfield(document.getElementById("starfield"), 3);
    EffectsManager.initParticles(document.getElementById("particles"), 48);
    EffectsManager.initCursor(document.getElementById("custom-cursor"));
    EffectsManager.parallax(document.getElementById("carousel-container"));

    // Carousel
    const carouselEl = document.getElementById("stellar-carousel");
    const dotNavEl = document.getElementById("dot-nav");
    const controls = {
      prev: document.getElementById("prev-btn"),
      next: document.getElementById("next-btn")
    };
    const navigator = new StellarNavigator(
      SLIDES,
      carouselEl,
      dotNavEl,
      controls
    );

    // Accessibility: Focus management
    carouselEl.addEventListener("focus", () => {
      navigator.slideEls[navigator.activeIdx].focus();
    });

    // Reduced Motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("reduced-motion");
    }
  }
});
