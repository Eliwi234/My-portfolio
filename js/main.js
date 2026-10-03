(function () {
  const data = window.PORTFOLIO;
  const stored = localStorage.getItem("eliwi-lang");
  let lang = stored === "en" || stored === "ar" ? stored : "ar";
  let filter = "all";
  let companyId = "hyper";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function t(key) {
    return data.ui[lang][key] || key;
  }

  function textOf(value) {
    if (value && typeof value === "object") return value[lang] || value.en || value.ar || "";
    return value || "";
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("meta.title");
    const description = $('meta[name="description"]');
    if (description) description.setAttribute("content", t("meta.description"));

    $$("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });

    const name = $("#hero-name");
    if (name) {
      name.replaceChildren(
        ...data.person.nameLines[lang].map((line) => {
          const span = document.createElement("span");
          span.textContent = line;
          return span;
        })
      );
    }

    const alt = $("#hero-alt");
    if (alt) alt.textContent = data.person.altName[lang];

    $$("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });

    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    renderProjects();
    renderSkills();
    renderCompanies();
  }

  function renderCompanies() {
    const board = $("#company-board");
    if (!board || !data.companies) return;
    if (!data.companies.some((company) => company.id === companyId)) {
      companyId = data.companies[0].id;
    }
    const active = data.companies.find((company) => company.id === companyId);
    const index = data.companies.findIndex((company) => company.id === companyId);

    board.innerHTML = `
      <div class="company-rail" role="tablist" aria-label="${esc(t("companies.kicker"))}">
        ${data.companies
          .map(
            (company, itemIndex) => `
          <button type="button" class="company-tab" role="tab" id="company-tab-${esc(company.id)}"
            aria-selected="${company.id === companyId}" aria-controls="company-panel" data-company="${esc(company.id)}">
            <span class="company-index">${String(itemIndex + 1).padStart(2, "0")}</span>
            <span>
              <strong>${esc(company.name)}</strong>
              <em>${esc(textOf(company.role))}</em>
            </span>
          </button>`
          )
          .join("")}
      </div>
      <div class="company-panel" id="company-panel" role="tabpanel" tabindex="0" aria-labelledby="company-tab-${esc(active.id)}">
        <p class="company-count">${String(index + 1).padStart(2, "0")} / ${String(data.companies.length).padStart(2, "0")}</p>
        <h3>${esc(active.name)}</h3>
        <p class="company-role">${esc(textOf(active.role))}</p>
        <ul class="points">${active.points[lang].map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
      </div>`;

    const buttons = $$("[data-company]", board);
    buttons.forEach((button) => {
      button.addEventListener("click", () => selectCompany(button.dataset.company));
    });

    const rail = $(".company-rail", board);
    if (rail) {
      rail.addEventListener("keydown", (event) => {
        const current = buttons.findIndex((button) => button.dataset.company === companyId);
        const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
        const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
        if (!forward && !backward) return;
        event.preventDefault();
        const next = (current + (forward ? 1 : -1) + buttons.length) % buttons.length;
        selectCompany(buttons[next].dataset.company, true);
      });
    }
  }

  function selectCompany(id, focusTab) {
    companyId = id;
    renderCompanies();
    if (focusTab) {
      const tab = $(`#company-tab-${id}`);
      if (tab) tab.focus();
    }
  }

  function linkLabel(type) {
    if (type === "live") return t("project.live");
    if (type === "front") return t("project.front");
    if (type === "back") return t("project.back");
    return t("project.code");
  }

  function stage(visual) {
    const stages = {
      kitchen: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>KitchenX</em></div>
          <div class="kitchen">
            <aside><span></span><span></span><span class="on"></span><span></span><span></span></aside>
            <div>
              <div class="stats"><b></b><b></b><b></b></div>
              <div class="meal"><span></span><div><strong></strong><em></em></div></div>
              <div class="meal"><span></span><div><strong></strong><em></em></div></div>
              <div class="meal"><span></span><div><strong></strong><em></em></div></div>
            </div>
          </div>
        </div>`,
      search: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>IR</em></div>
          <div class="search">
            <div class="query"><span></span></div>
            <div class="hit"><b></b><em style="--w:86%"></em></div>
            <div class="hit"><b></b><em style="--w:71%"></em></div>
            <div class="hit"><b></b><em style="--w:58%"></em></div>
            <div class="hit"><b></b><em style="--w:44%"></em></div>
          </div>
        </div>`,
      curriculum: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>Python</em></div>
          <div class="levels">
            <div><span>01</span><b></b></div>
            <div><span>02</span><b></b></div>
            <div><span>03</span><b></b></div>
            <div><span>04</span><b></b></div>
          </div>
        </div>`,
      learn: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>print</em></div>
          <div class="lesson">
            <code>print("hello")</code>
            <div class="dots"><i></i><i class="on"></i><i></i><i></i></div>
            <p></p><p></p>
          </div>
        </div>`,
      bank: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>Ledger</em></div>
          <div class="bank">
            <div class="balance"><span></span><strong></strong></div>
            <div class="tx in"></div>
            <div class="tx out"></div>
            <div class="tx in"></div>
            <div class="tx out"></div>
          </div>
        </div>`,
      complaint: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>Case</em></div>
          <div class="cases">
            <div><b></b><i class="open"></i></div>
            <div><b></b><i class="wait"></i></div>
            <div><b></b><i class="done"></i></div>
            <div><b></b><i class="open"></i></div>
          </div>
        </div>`,
      compiler: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>ANTLR</em></div>
          <pre class="code"><span class="k">visitor</span> <span class="f">check</span>(<span class="n">node</span>)
  <span class="k">if</span> unbound:
    <span class="e">error</span>(node)
  <span class="k">return</span> table</pre>
        </div>`,
      wifi: `
        <div class="win">
          <div class="win-bar"><i></i><i></i><i></i><em>HyperWifi</em></div>
          <div class="wifi">
            <div class="signal"><span></span><span></span><span></span></div>
            <div class="field"></div>
            <div class="field short"></div>
            <div class="send"></div>
          </div>
        </div>`,
    };
    return stages[visual] || stages.kitchen;
  }

  function renderProjects() {
    const list = $("#work-list");
    if (!list) return;
    const visible = data.projects.filter((project) => filter === "all" || project.kind === filter);
    if (!visible.length) {
      list.innerHTML = `<p class="empty">${esc(t("empty"))}</p>`;
      return;
    }

    list.innerHTML = data.projects
      .map((project, index) => {
        const hidden = filter !== "all" && project.kind !== filter;
        const number = String(index + 1).padStart(2, "0");
        const links = project.links
          .map(
            (link) =>
              `<a class="text-link" href="${esc(link.href)}" target="_blank" rel="noreferrer">${esc(linkLabel(link.type))}</a>`
          )
          .join("");
        const points = project.points[lang].map((point) => `<li>${esc(point)}</li>`).join("");
        const stack = project.stack.map((item) => `<li>${esc(item)}</li>`).join("");
        return `
          <article class="project" data-kind="${esc(project.kind)}" ${hidden ? "hidden" : ""}>
            <div class="project-copy">
              <p class="project-kicker">
                <span>${number}</span>
                <span>${esc(t("kind." + project.kind))}</span>
                <span>${esc(t("project.updated"))} ${esc(project.year)}</span>
              </p>
              <h3>${esc(textOf(project.title))}</h3>
              <p>${esc(project.summary[lang])}</p>
              <ul class="points">${points}</ul>
              <ul class="stack">${stack}</ul>
              <div class="project-links">${links}</div>
            </div>
            <div class="stage" aria-hidden="true">${stage(project.visual)}</div>
          </article>`;
      })
      .join("");
  }

  function renderSkills() {
    const root = $("#skill-groups");
    if (!root) return;
    root.innerHTML = data.skills
      .map(
        (group) => `
        <section class="skill-group">
          <h3>${esc(textOf(group.title))}</h3>
          <ul>${group.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
        </section>`
      )
      .join("");
  }

  function setLanguage(next) {
    lang = next;
    localStorage.setItem("eliwi-lang", next);
    applyLanguage();
    closeMenu();
  }

  function closeMenu() {
    const panel = $("#nav-panel");
    const toggle = $("#nav-toggle");
    if (!panel || !toggle) return;
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function toast(message) {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove("show"), 1600);
  }

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast(t("contact.copied"));
    } catch {
      toast(value);
    }
  }

  $$("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  $$("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      $$("[data-filter]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      renderProjects();
    });
  });

  const toggle = $("#nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const panel = $("#nav-panel");
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  $$("#nav-panel a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copy(button.dataset.copy));
  });

  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#form-name").value.trim();
      const email = $("#form-email").value.trim();
      const message = $("#form-message").value.trim();
      const body = `${message}\n\n— ${name}\n${email}`;
      const href = `mailto:${data.person.email}?subject=${encodeURIComponent(t("contact.subject"))}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    });
  }

  const portrait = $("#portrait");
  if (portrait) {
    const reveal = () => {
      portrait.hidden = false;
    };
    const drop = () => portrait.remove();
    portrait.addEventListener("load", reveal);
    portrait.addEventListener("error", drop);
    if (portrait.complete) {
      if (portrait.naturalWidth > 0) reveal();
      else drop();
    }
  }

  const progress = $("#progress");
  if (progress) {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const value = height > 0 ? window.scrollY / height : 0;
      progress.style.transform = `scaleX(${value})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const navLinks = $$(".nav-links a");
  const watched = navLinks
    .map((link) => ({ link, section: document.getElementById(link.getAttribute("href").slice(1)) }))
    .filter((item) => item.section);
  if (watched.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const current = watched.find((item) => item.section === entry.target);
          navLinks.forEach((link) => link.classList.toggle("is-current", link === current.link));
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    watched.forEach((item) => spy.observe(item.section));
  }

  applyLanguage();
})();
