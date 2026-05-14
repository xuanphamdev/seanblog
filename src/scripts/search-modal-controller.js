const SEARCH_LABELS = {
  vi: {
    placeholder: "Tìm bài viết...",
    empty: "Không có kết quả.",
    unavailable: "Chưa có index tìm kiếm. Chạy npm run build rồi npm run preview để kiểm tra search.",
  },
  en: {
    placeholder: "Search posts...",
    empty: "No results.",
    unavailable: "Search index is not available. Run npm run build then npm run preview to test search.",
  },
};

if (!window.__seandevSearchReady) {
  window.__seandevSearchReady = true;

  const state = {
    pagefind: null,
    pagefindFailed: false,
    activeIdx: -1,
    lastQuery: "",
    timer: null,
  };

  const getLang = () => (document.documentElement.lang === "en" ? "en" : "vi");

  function getDom() {
    const modal = document.getElementById("search-modal");
    const input = document.getElementById("search-input");
    const results = document.getElementById("search-results");
    return modal && input && results ? { modal, input, results } : null;
  }

  async function loadPagefind() {
    if (state.pagefind) return state.pagefind;
    if (state.pagefindFailed) return null;
    try {
      const pagefindPath = "/pagefind/pagefind.js";
      state.pagefind = await import(/* @vite-ignore */ pagefindPath);
      await state.pagefind.options({});
      return state.pagefind;
    } catch {
      state.pagefindFailed = true;
      return null;
    }
  }

  function renderMessage(results, text) {
    results.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = text;
    results.appendChild(empty);
  }

  function syncCopy(dom) {
    dom.input.placeholder = SEARCH_LABELS[getLang()].placeholder;
  }

  function openSearch() {
    const dom = getDom();
    if (!dom) return;
    syncCopy(dom);
    dom.modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dom.input.focus());
    loadPagefind().then((pf) => {
      if (!pf && !dom.input.value.trim()) {
        renderMessage(dom.results, SEARCH_LABELS[getLang()].unavailable);
      }
    });
  }

  function closeSearch() {
    const dom = getDom();
    if (!dom) return;
    dom.modal.hidden = true;
    document.body.style.overflow = "";
    dom.input.value = "";
    dom.results.innerHTML = "";
    state.activeIdx = -1;
  }

  function renderResults(items) {
    const dom = getDom();
    if (!dom) return;
    dom.results.innerHTML = "";
    state.activeIdx = -1;
    if (!items.length) {
      renderMessage(dom.results, SEARCH_LABELS[getLang()].empty);
      return;
    }
    items.forEach((item, i) => {
      const link = document.createElement("a");
      link.href = item.url;
      link.className = "search-result";
      link.dataset.idx = String(i);

      const title = document.createElement("div");
      title.className = "search-result-title";
      title.textContent = item.meta.title || item.url;

      const meta = document.createElement("div");
      meta.className = "search-result-meta";
      const parts = [];
      if (item.meta.lang) parts.push(item.meta.lang.toUpperCase());
      if (item.meta.date) parts.push(item.meta.date);
      meta.textContent = parts.join(" · ");

      const snippet = document.createElement("div");
      snippet.className = "search-result-snippet";
      snippet.innerHTML = item.excerpt;

      link.append(title, meta, snippet);
      dom.results.appendChild(link);
    });
  }

  function setActive(idx) {
    const dom = getDom();
    if (!dom) return;
    const items = dom.results.querySelectorAll(".search-result");
    if (!items.length) return;
    state.activeIdx = ((idx % items.length) + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle("is-active", i === state.activeIdx));
    items[state.activeIdx].scrollIntoView({ block: "nearest" });
  }

  async function handleInput(event) {
    const dom = getDom();
    if (!dom) return;
    const q = event.currentTarget.value.trim();
    state.lastQuery = q;
    clearTimeout(state.timer);
    if (!q) {
      dom.results.innerHTML = "";
      return;
    }
    state.timer = setTimeout(async () => {
      const pf = await loadPagefind();
      if (!pf) {
        renderMessage(dom.results, SEARCH_LABELS[getLang()].unavailable);
        return;
      }
      if (q !== state.lastQuery) return;
      const search = await pf.search(q, { filters: { lang: getLang() } });
      const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
      if (q === state.lastQuery) renderResults(items);
    }, 150);
  }

  function handleInputKeydown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(state.activeIdx + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(state.activeIdx - 1);
    } else if (event.key === "Enter") {
      const dom = getDom();
      const items = dom?.results.querySelectorAll(".search-result");
      const target = items?.[state.activeIdx >= 0 ? state.activeIdx : 0];
      if (target) target.click();
    }
  }

  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
  }

  function handleDocumentKeydown(event) {
    const dom = getDom();
    if (!dom) return;
    const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
    const isSearchShortcut =
      (event.metaKey || event.ctrlKey) && !event.altKey && (key === "k" || event.code === "KeyK");
    if (isSearchShortcut) {
      event.preventDefault();
      event.stopPropagation();
      dom.modal.hidden ? openSearch() : closeSearch();
    } else if (key === "escape" && !dom.modal.hidden) {
      event.preventDefault();
      closeSearch();
    } else if (key === "/" && dom.modal.hidden && !isEditableTarget(event.target)) {
      event.preventDefault();
      openSearch();
    }
  }

  function bindCurrentModal() {
    const dom = getDom();
    if (!dom) return;
    syncCopy(dom);
    if (dom.input.dataset.searchBound === "true") return;
    dom.input.dataset.searchBound = "true";
    dom.input.addEventListener("input", handleInput);
    dom.input.addEventListener("keydown", handleInputKeydown);
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("#search-trigger")) {
      event.preventDefault();
      openSearch();
    } else if (target?.closest("[data-search-close]")) {
      event.preventDefault();
      closeSearch();
    }
  });

  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("DOMContentLoaded", bindCurrentModal);
  document.addEventListener("astro:page-load", bindCurrentModal);
  bindCurrentModal();
}
