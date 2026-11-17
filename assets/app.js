/* Лендинг: меню, калькулятор раскладки, формы в WhatsApp, аккордеон */
(function () {
  "use strict";

  var PHONE = "375447078184";

  /* ---------- меню ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* ---------- аккордеон ---------- */
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var panel = item.querySelector(".faq__a");
      var wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq__item.open").forEach(function (o) {
        if (o !== item) {
          o.classList.remove("open");
          o.querySelector(".faq__a").style.maxHeight = null;
          o.querySelector(".faq__q").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !wasOpen);
      q.setAttribute("aria-expanded", wasOpen ? "false" : "true");
      panel.style.maxHeight = wasOpen ? null : panel.scrollHeight + "px";
    });
  });

  /* ---------- появление ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- калькулятор ---------- */
  var OVERLAP = 0.1;      /* нахлёст на шов, м */
  var ALLOW = 0.15;       /* припуск на примыкания, м */
  var ROLL_LEN = 20;      /* длина рулона, м */
  var PRICE = 30;         /* р./м² работы */

  var lenEl = document.getElementById("c-len");
  var widEl = document.getElementById("c-wid");
  var rollEl = document.getElementById("c-roll");
  var seg = document.getElementById("roll-seg");
  var outArea = document.getElementById("o-area");
  var outStrips = document.getElementById("o-strips");
  var outWeld = document.getElementById("o-weld");
  var outRolls = document.getElementById("o-rolls");
  var outCost = document.getElementById("o-cost");
  var sendBtn = document.getElementById("o-send");

  var fmt = function (n) { return n.toLocaleString("ru-RU"); };

  function calc() {
    var L = parseFloat(lenEl.value) || 0;
    var W = parseFloat(widEl.value) || 0;
    var roll = parseFloat(rollEl.value) || 1.5;
    if (L <= 0 || W <= 0) {
      outArea.textContent = "—"; outStrips.textContent = "—";
      outWeld.textContent = "—"; outRolls.textContent = "—"; outCost.textContent = "—";
      return { L: 0, W: 0, strips: 0, weld: 0, rolls: 0, area: 0, cost: 0 };
    }
    var area = L * W;
    var strips = Math.max(1, Math.ceil(W / (roll - OVERLAP)));
    var weld = (strips - 1) * L;
    var membrane = strips * roll * (L + ALLOW * 2);
    var rolls = Math.ceil(membrane / (roll * ROLL_LEN));
    var cost = Math.round(area * PRICE);

    outArea.textContent = fmt(Math.round(area)) + " м²";
    outStrips.textContent = strips + " шт";
    outWeld.textContent = fmt(Math.round(weld)) + " м";
    outRolls.textContent = rolls + " шт";
    outCost.textContent = fmt(cost);

    if (sendBtn) {
      var msg = "Здравствуйте! Расчёт кровли из ПВХ мембраны:\n" +
        "Размеры: " + L + " × " + W + " м\n" +
        "Площадь: " + Math.round(area) + " м²\n" +
        "Рулон: " + String(roll).replace(".", ",") + " м\n" +
        "Полос: " + strips + ", швов: " + Math.round(weld) + " м, рулонов: " + rolls + "\n" +
        "Ориентир по работам: " + fmt(cost) + " р.\n" +
        "Подскажите стоимость материалов и сроки.";
      sendBtn.href = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg);
    }
    return { L: L, W: W, strips: strips, weld: weld, rolls: rolls, area: area, cost: cost };
  }

  if (lenEl && widEl) {
    lenEl.addEventListener("input", calc);
    widEl.addEventListener("input", calc);
    if (seg) {
      seg.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-on"); });
          b.classList.add("is-on");
          rollEl.value = b.getAttribute("data-roll");
          calc();
        });
      });
    }
    calc();
  }

  /* ---------- заявка ---------- */
  var lead = document.getElementById("lead-form");
  if (lead) {
    lead.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("l-name").value || "").trim();
      var phone = (document.getElementById("l-phone").value || "").trim();
      var area = (document.getElementById("l-area").value || "").trim();
      if (phone.replace(/\D/g, "").length < 6) {
        document.getElementById("l-phone").focus();
        document.getElementById("l-phone").style.borderColor = "#E0562A";
        return;
      }
      var msg = "Здравствуйте! Заявка с сайта на плоскую кровлю из ПВХ мембраны.\n" +
        (name ? "Имя: " + name + "\n" : "") +
        "Телефон: " + phone + "\n" +
        (area ? "Площадь: " + area + " м²\n" : "") +
        "Прошу связаться и посчитать стоимость.";
      window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg), "_blank");
    });
  }
})();
