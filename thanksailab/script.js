(() => {
  const storageKey = "thanksailab-lang";
  const html = document.documentElement;
  const switcher = document.getElementById("langSwitch");

  const setMeta = (lang) => {
    const title = document.body.dataset[lang === "ru" ? "titleRu" : "titleEn"];
    const description = document.body.dataset[lang === "ru" ? "descriptionRu" : "descriptionEn"];
    if (title) document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  };

  const setLang = (lang) => {
    const safe = lang === "ru" ? "ru" : "en";
    html.setAttribute("data-lang", safe);
    html.setAttribute("lang", safe);
    localStorage.setItem(storageKey, safe);
    setMeta(safe);
  };

  const initialLang = (() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "ru" || saved === "en") return saved;
    return "en";
  })();

  setLang(initialLang);

  if (switcher) {
    switcher.addEventListener("click", () => {
      const next = html.getAttribute("data-lang") === "ru" ? "en" : "ru";
      setLang(next);
    });
  }

  const projectCount = document.querySelectorAll(".project-card").length;
  document.querySelectorAll("[data-project-count]").forEach((el) => {
    el.textContent = String(projectCount);
  });

  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((el) => observer.observe(el));
})();
