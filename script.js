// ---- FULL UPDATED SCRIPT ----

// Remove any old leftover key from earlier attempts
try { sessionStorage.removeItem("splashPlayed"); } catch (e) { /* ignore */ }

// --- Splash / Home-load logic ---
(function () {
  const SKIP_KEY = "skipSplashOnNextLoad";

  document.addEventListener("click", (ev) => {
    try {
      let el = ev.target;
      while (el && el.nodeName !== "A") el = el.parentElement;
      if (!el || !el.href) return;

      const url = new URL(el.href, location.href);
      if (url.origin !== location.origin) return;

      const p = url.pathname.replace(/\/+$/, "") || "/";
      const isHomeLink = p === "/" || p === "/index.html" || url.pathname.endsWith("/index.html");

      if (isHomeLink) {
        sessionStorage.setItem(SKIP_KEY, "true");
      }
    } catch (err) {
      console.error("Link-capture error:", err);
    }
  }, true);

  function getNavType() {
    try {
      const navEntries = performance.getEntriesByType?.("navigation");
      if (navEntries?.length) return navEntries[0].type;
      if (performance.navigation) {
        const t = performance.navigation.type;
        if (t === 1) return "reload";
        if (t === 2) return "back_forward";
        return "navigate";
      }
    } catch (e) {}
    return "navigate";
  }

  function showSplashThenMain(splash, main, visibleMs = 2000, fadeMs = 1000) {
    splash.classList.remove("fade-out");
    splash.style.display = splash.style.display || "flex";
    main.style.display = "none";
    setTimeout(() => {
      splash.classList.add("fade-out");
      setTimeout(() => {
        splash.style.display = "none";
        main.style.display = "block";
      }, fadeMs);
    }, visibleMs);

    // Safety fallback: ensure main shows even if fade timing breaks
    setTimeout(() => {
      main.style.display = "block";
    }, visibleMs + fadeMs + 500);
  }

  function skipSplashImmediately(splash, main) {
    splash.style.display = "none";
    main.style.display = "block";
  }

  function decideAndRun() {
    try {
      const splash = document.getElementById("splash-screen");
      const main = document.getElementById("main-content");
      if (!main) return;
      if (!splash) { main.style.display = "block"; return; }

      const navType = getNavType();
      const skipFlag = sessionStorage.getItem(SKIP_KEY);

      if (navType === "reload") {
        sessionStorage.removeItem(SKIP_KEY);
        showSplashThenMain(splash, main);
        return;
      }

      if (navType === "back_forward") {
        sessionStorage.removeItem(SKIP_KEY);
        skipSplashImmediately(splash, main);
        return;
      }

      if (skipFlag) {
        sessionStorage.removeItem(SKIP_KEY);
        skipSplashImmediately(splash, main);
        return;
      }

      if (document.referrer) {
        try {
          const ref = new URL(document.referrer);
          if (ref.origin === location.origin && ref.pathname !== location.pathname) {
            skipSplashImmediately(splash, main);
            return;
          }
        } catch (e) {}
      }

      showSplashThenMain(splash, main);
    } catch (err) {
      console.error("decideAndRun error:", err);
      const main = document.getElementById("main-content");
      if (main) main.style.display = "block";
    } finally {
      // Final safety: if all else fails, show main after 3s
      setTimeout(() => {
        const main = document.getElementById("main-content");
        if (main && main.style.display === "none") {
          main.style.display = "block";
        }
      }, 3000);
    }
  }

  if (document.readyState === "complete") decideAndRun();
  else window.addEventListener("load", decideAndRun);
})();

// --- Initialize EmailJS ---
(function () {
  try {
    emailjs.init("VX92KrsVcIlN1togN"); // ✅ Your Public Key
  } catch (err) {
    console.error("EmailJS init error:", err);
  }
})();

// --- Booking Panel & Form Handling ---
document.addEventListener("DOMContentLoaded", () => {
  try {
    const bookNowBtn = document.getElementById("bookNowBtn");
    const bookingPanel = document.getElementById("bookingPanel");
    const closeBtn = document.getElementById("closeBookingPanel");

    if (bookNowBtn && bookingPanel) {
      bookNowBtn.addEventListener("click", () => bookingPanel.classList.add("visible"));
    }

    if (closeBtn && bookingPanel) {
      closeBtn.addEventListener("click", () => bookingPanel.classList.remove("visible"));
    }

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
      bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name")?.value || "";
        const address = document.getElementById("address")?.value || "";
        const service = document.getElementById("service")?.value || "";
        const phone = document.getElementById("pNumber")?.value || "";

        try {
          emailjs
            .send("service_fvzmc2q", "template_mf4uod7", { name, address, service, phone })
            .then(
              function () {
                const status = document.getElementById("statusMessage");
                if (status) status.textContent = "Booking sent successfully!";
                bookingForm.reset();
              },
              function (error) {
                const status = document.getElementById("statusMessage");
                if (status) status.textContent = "Failed to send. Please try again.";
                console.error("EmailJS send error:", error);
              }
            );
        } catch (err) {
          console.error("EmailJS call error:", err);
          const status = document.getElementById("statusMessage");
          if (status) status.textContent = "Failed to send. Please try again.";
        }
      });
    }
  } catch (err) {
    console.error("Booking panel error:", err);
  }
});

// --- Intersection Observer Animations ---
try {
  const sections = document.querySelectorAll("main .sectionnn");
  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    sections.forEach((sec) => observer.observe(sec));
  }
} catch (err) {
  console.error("IntersectionObserver error:", err);
}
