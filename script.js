// ---- FULL OPTIMIZED SCRIPT ----

// Remove leftover sessionStorage key
try { sessionStorage.removeItem("splashPlayed"); } catch (e) {}

// --- Splash / Home-load logic ---
(function () {
  const SKIP_KEY = "skipSplashOnNextLoad";

  document.addEventListener("click", (ev) => {
    let el = ev.target;
    while (el && el.nodeName !== "A") el = el.parentElement;
    if (!el || !el.href) return;

    const url = new URL(el.href, location.href);
    if (url.origin !== location.origin) return;

    const p = url.pathname.replace(/\/+$/, "") || "/";
    const isHomeLink = p === "/" || p === "/index.html" || url.pathname.endsWith("/index.html");

    if (isHomeLink) sessionStorage.setItem(SKIP_KEY, "true");
  }, true);

  function getNavType() {
    try {
      const navEntries = performance.getEntriesByType?.("navigation");
      if (navEntries?.length) return navEntries[0].type;
      const t = performance.navigation?.type;
      if (t === 1) return "reload";
      if (t === 2) return "back_forward";
    } catch (e) {}
    return "navigate";
  }

  function showSplashThenMain(splash, main, visibleMs = 500, fadeMs = 800) {
    splash.classList.remove("fade-out");
    splash.style.display = "flex";
    main.style.display = "none";

    setTimeout(() => {
      splash.classList.add("fade-out");
      setTimeout(() => {
        splash.style.display = "none";
        main.style.display = "block";
      }, fadeMs);
    }, visibleMs);
  }

  function skipSplashImmediately(splash, main) {
    if (splash) splash.style.display = "none";
    if (main) main.style.display = "block";
  }

  function decideAndRun() {
    const splash = document.getElementById("splash-screen");
    const main = document.getElementById("main-content");
    if (!main) return;

    const navType = getNavType();
    const skipFlag = sessionStorage.getItem(SKIP_KEY);

    if (navType === "back_forward" || skipFlag || (document.referrer && new URL(document.referrer).origin === location.origin && document.referrer !== location.href)) {
      sessionStorage.removeItem(SKIP_KEY);
      skipSplashImmediately(splash, main);
      return;
    }

    sessionStorage.removeItem(SKIP_KEY);
    showSplashThenMain(splash, main);
  }

  if (document.readyState === "complete") decideAndRun();
  else window.addEventListener("load", decideAndRun);
})();

// --- Initialize EmailJS ---
(function () {
  try { emailjs.init("VX92KrsVcIlN1togN"); }
  catch (err) { console.error("EmailJS init error:", err); }
})();

// --- Booking Panel & Form Handling ---
document.addEventListener("DOMContentLoaded", () => {
  const bookNowBtn = document.getElementById("bookNowBtn");
  const bookingPanel = document.getElementById("bookingPanel");
  const closeBtn = document.getElementById("closeBookingPanel");

  if (bookNowBtn && bookingPanel) {
    bookNowBtn.addEventListener("click", () => bookingPanel.classList.add("visible"));
  }
  if (closeBtn && bookingPanel) {
    closeBtn.addEventListener("click", () => bookingPanel.classList.remove("visible"));
  }

  // Multi-select service logic
  const serviceSelect = document.getElementById("service");
  const selectedContainer = document.getElementById("selectedServices");
  let selectedServices = [];

  serviceSelect?.addEventListener("change", () => {
    const newSelection = Array.from(serviceSelect.selectedOptions).map(opt => opt.value);
    newSelection.forEach(svc => { if (!selectedServices.includes(svc)) selectedServices.push(svc); });
    renderSelectedServices();
  });

  function renderSelectedServices() {
    if (!selectedContainer) return;
    selectedContainer.innerHTML = "";
    const frag = document.createDocumentFragment();
    selectedServices.forEach(service => {
      const tag = document.createElement("span");
      tag.textContent = service;
      tag.className = "service-tag"; // move styles to CSS
      tag.addEventListener("click", () => {
        selectedServices = selectedServices.filter(s => s !== service);
        renderSelectedServices();
      });
      frag.appendChild(tag);
    });
    selectedContainer.appendChild(frag);
  }

  // Booking form submission
  const bookingForm = document.getElementById("bookingForm");
  bookingForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name")?.value || "";
    const address = document.getElementById("address")?.value || "";
    const phone = document.getElementById("pNumber")?.value || "";
    const message = document.getElementById("message")?.value || "";

    emailjs.send("service_fvzmc2q", "template_dg6kcmo", {
      name, address, service: selectedServices.join(", "), phone, message
    }).then(() => {
      document.getElementById("statusMessage").textContent = "Booking sent successfully!";
      bookingForm.reset();
      selectedServices = [];
      renderSelectedServices();
    }).catch(err => {
      document.getElementById("statusMessage").textContent = "Failed to send. Please try again.";
      console.error("EmailJS send error:", err);
    });
  });
});

// --- Intersection Observer Animations ---
try {
  const sections = document.querySelectorAll("main .sectionnn");
  if (sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    sections.forEach(sec => observer.observe(sec));
  }
} catch (err) { console.error("IntersectionObserver error:", err); }

// --- Hamburger Menu Toggle ---
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.querySelector("header nav");
  const header = document.querySelector("header");

  if (menuToggle && navMenu && header) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      header.classList.toggle("nav-open");
    });

    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        header.classList.remove("nav-open");
      });
    });
  }
});
