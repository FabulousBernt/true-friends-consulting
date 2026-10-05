/* True Friends — page behavior: language, mobile nav, modal, forms. */
(function () {
  "use strict";

  const SUPPORTED = ["en", "sv"];
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "tf_lang";

  // Substituted into any translation string containing `{year}`, so the footer
  // copyright rolls over on its own.
  const CURRENT_YEAR = new Date().getFullYear();
  const substitute = (s) => s.replace("{year}", CURRENT_YEAR);

  // Exposed so the form status messages below can read the active language.
  let currentLang = DEFAULT_LANG;

  const getNested = (obj, path) =>
    path
      .split(".")
      .reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

  /**
   * Look up a translation key in the active language, with English fallback.
   * Supports {placeholder} substitution via the params object.
   */
  function t(key, params) {
    const dicts = window.TF_TRANSLATIONS || {};
    let value = getNested(dicts[currentLang], key);
    if (value === undefined) value = getNested(dicts[DEFAULT_LANG], key);
    if (typeof value !== "string") return key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  }

  /* Every attribute a translation can be written into. The list is the same
     shape as ATTRS in tools/i18n.js, which checks both directions. */
  const ATTR_TARGETS = [
    ["data-i18n", "textContent"],
    ["data-i18n-html", "innerHTML"],
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-aria-label", "aria-label"],
    ["data-i18n-content", "content"],
    ["data-i18n-href", "href"],
    ["data-i18n-alt", "alt"],
    ["data-i18n-src", "src"],
  ];

  function applyTranslations(lang) {
    const dict = (window.TF_TRANSLATIONS || {})[lang];
    if (!dict) {
      // No dictionary to apply — reveal rather than sit behind the veil.
      document.documentElement.removeAttribute("data-tf-translating");
      return;
    }
    currentLang = lang;
    document.documentElement.lang = lang;

    for (const [attr, prop] of ATTR_TARGETS) {
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        const v = getNested(dict, el.getAttribute(attr));
        if (typeof v !== "string") return;
        // Hero marks swap one artwork for another per language. Reassigning
        // the same src would restart the decode, so it is skipped.
        if (prop === "src" && el.getAttribute("src") === v) return;
        if (prop === "textContent" || prop === "innerHTML") {
          el[prop] = substitute(v);
        } else {
          el.setAttribute(prop, substitute(v));
        }
      });
    }

    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        String(btn.getAttribute("data-lang") === lang),
      );
    });

    // lang-boot.js hid the page so the English markup would not flash before
    // this ran. It has run.
    document.documentElement.removeAttribute("data-tf-translating");
  }

  /**
   * English is the default for everyone. The only thing that changes it is the
   * visitor picking SV from the switcher, which is stored in localStorage and
   * so carries across pages and return visits until they pick EN again.
   *
   * There is deliberately no locale guessing here — no IP lookup, no
   * navigator.language. A Swedish speaker abroad, or an English speaker in
   * Sweden, both got the wrong page under that scheme, and the IP lookup also
   * meant a network round-trip that could swap the language out from under
   * someone after first paint.
   */
  function detectLanguageSync() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch (e) {
      // Storage blocked — fall through to the default.
    }
    return DEFAULT_LANG;
  }

  // Applied immediately so the first paint is already in the right language.
  applyTranslations(detectLanguageSync());

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (!SUPPORTED.includes(lang)) return;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        // Storage blocked — the choice just will not carry to the next page.
      }
      applyTranslations(lang);
    });
  });

  // A page restored from the back/forward cache keeps its frozen DOM and JS
  // state — none of the code above re-runs. So a language picked on another
  // page in the meantime would never reach this one on the way back.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    const lang = detectLanguageSync();
    if (lang !== currentLang) applyTranslations(lang);
  });

  /* ---------- Mobile nav ---------- */
  const nav = document.getElementById("site-nav");
  const toggle = nav && nav.querySelector(".nav__toggle");

  if (nav && toggle) {
    const setOpen = (open) => {
      nav.setAttribute("data-open", String(open));
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
      setOpen(nav.getAttribute("data-open") !== "true");
    });

    nav.querySelectorAll(".nav__drawer a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
  }

  /* ---------- Back-to-top ---------- */
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.hidden = false;
    const updateVisibility = () => {
      backToTop.setAttribute(
        "data-visible",
        String(window.scrollY > window.innerHeight * 0.6),
      );
    };
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Modal ---------- */
  const openDialog = (dialog) => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };

  document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = document.getElementById(trigger.getAttribute("data-modal-open"));
      if (dialog) openDialog(dialog);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = trigger.closest("dialog");
      if (!dialog) return;
      dialog.close();
      const status = dialog.querySelector(".form__status");
      if (status) status.textContent = "";
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    // Clicking the backdrop lands on the dialog element itself, not its inner
    // box, so that is the close target.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  /* ---------- Forms ---------- */

  const MAX_LENGTHS = {
    firstName: 50,
    lastName: 50,
    email: 254,
    message: 2000,
  };

  const sanitizeSingleLine = (value) =>
    String(value)
      .replace(/[\r\n\t\0\x00-\x1F\x7F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const sanitizeMultiline = (value) =>
    String(value)
      .replace(/\r\n/g, "\n")
      .replace(/[\0\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();

  const sanitizePayload = (raw) => {
    const out = {};
    for (const [key, val] of Object.entries(raw)) {
      const capped = String(val).slice(0, MAX_LENGTHS[key] || 5000);
      out[key] =
        key === "message" ? sanitizeMultiline(capped) : sanitizeSingleLine(capped);
    }
    return out;
  };

  const RATE_LIMIT_MS = 10_000;

  document.querySelectorAll("form[data-endpoint]").forEach((form) => {
    const status = form.querySelector(".form__status");
    const submitBtn = form.querySelector('button[type="submit"]');
    let lastSubmitAt = 0;

    const setStatus = (text, state) => {
      if (!status) return;
      status.textContent = text;
      if (state) status.setAttribute("data-state", state);
      else status.removeAttribute("data-state");
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const now = Date.now();
      if (now - lastSubmitAt < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitAt)) / 1000);
        setStatus(t("status.rateLimited", { wait }), "error");
        return;
      }

      if (!form.reportValidity()) return;

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        setStatus(t("status.notConfigured"), "error");
        return;
      }

      const raw = Object.fromEntries(new FormData(form).entries());

      // Honeypot: silently succeed if a bot filled the hidden field.
      if (raw._honey && String(raw._honey).trim() !== "") {
        form.reset();
        setStatus(t("status.success"), "success");
        lastSubmitAt = now;
        return;
      }

      const userKeys = ["firstName", "lastName", "email", "message"];
      const sanitized = sanitizePayload(
        Object.fromEntries(userKeys.map((k) => [k, raw[k] ?? ""])),
      );
      const payload = { ...raw, ...sanitized };
      delete payload._honey;

      submitBtn.disabled = true;
      setStatus(t("status.sending"));
      lastSubmitAt = now;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success !== "false") {
          form.reset();
          setStatus(t("status.success"), "success");
        } else {
          setStatus(data.message || t("status.error"), "error");
        }
      } catch (err) {
        setStatus(t("status.network"), "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  });
})();