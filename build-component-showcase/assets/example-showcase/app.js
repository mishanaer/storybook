import { catalog } from "./catalog.js";

const app = document.querySelector("#app");
const pageIds = new Set(catalog.flatMap((group) => group.items.map((item) => item.id)));

const pages = {
  colors: () => `
    <section class="page-head"><p>Foundations</p><h1>Colors</h1><span>Semantic tokens inherited from the product.</span></section>
    <section class="card"><h2>Base</h2><div class="swatches">
      ${[
        ["Background", "var(--background)"],
        ["Surface", "var(--surface)"],
        ["Primary", "var(--primary)"],
        ["Accent", "var(--accent)"],
      ].map(([name, color]) => `<div class="swatch"><i style="background:${color}"></i><strong>${name}</strong><code>${color}</code></div>`).join("")}
    </div></section>`,
  typography: () => `
    <section class="page-head"><p>Foundations</p><h1>Typography</h1><span>The showcase renders with the product font stack.</span></section>
    <section class="card type-ramp"><div><small>Display</small><b>Interface that feels familiar</b></div><div><small>Title</small><h2>Build with real components</h2></div><div><small>Body</small><p>Examples should use realistic content and cover meaningful states.</p></div></section>`,
  button: () => `
    <section class="page-head"><p>Components</p><h1>Button</h1><span>Actions with product tokens and interaction states.</span></section>
    <section class="card"><h2>Variants</h2><div class="row"><button class="button primary">Continue</button><button class="button secondary">Details</button><button class="button ghost">Cancel</button></div></section>
    <section class="card"><h2>States</h2><div class="row"><button class="button primary">Default</button><button class="button primary" disabled>Disabled</button><button class="button primary loading"><i></i>Loading</button></div></section>`,
  cell: () => `
    <section class="page-head"><p>Components</p><h1>Cell</h1><span>Rows for settings, navigation, and compact data.</span></section>
    <section class="card cells"><button><i class="avatar">A</i><span><strong>Account</strong><small>Personal profile</small></span><b>›</b></button><button><i class="avatar violet">N</i><span><strong>Notifications</strong><small>Enabled</small></span><b>›</b></button></section>`,
  input: () => `
    <section class="page-head"><p>Components</p><h1>Input</h1><span>Labels, hints, and error messaging.</span></section>
    <section class="card form"><label>Full name<input value="Alex Morgan" /></label><label>Email<input type="email" placeholder="name@example.com" /></label><label class="error">Card number<input value="4242" /><small>Enter the complete card number</small></label></section>`,
  switch: () => `
    <section class="page-head"><p>Components</p><h1>Switch</h1><span>A compact binary control with a generous hit target.</span></section>
    <section class="card cells"><label><span><strong>Notifications</strong><small>Product updates and activity</small></span><input class="toggle" type="checkbox" checked /></label><label><span><strong>Weekly digest</strong><small>Sent every Friday</small></span><input class="toggle" type="checkbox" /></label></section>`,
};

function currentId() {
  const id = location.hash.replace("#/", "");
  return pageIds.has(id) ? id : "colors";
}

function renderCatalog(active, query = "") {
  const value = query.trim().toLowerCase();
  return catalog.map((group) => {
    const items = group.items.filter((item) => `${group.title} ${item.title}`.toLowerCase().includes(value));
    if (!items.length) return "";
    return `<section class="nav-group"><h2>${group.title}</h2>${items.map((item) => `<a href="#/${item.id}" class="${item.id === active ? "active" : ""}">${item.title}<span>›</span></a>`).join("")}</section>`;
  }).join("");
}

function render() {
  const active = currentId();
  app.innerHTML = `
    <div class="shell">
      <aside>
        <header><a class="brand" href="#/colors"><i></i>Showcase</a><button class="theme" aria-label="Toggle theme">◐</button></header>
        <div class="search"><span>⌕</span><input type="search" placeholder="Find a component" /></div>
        <nav>${renderCatalog(active)}</nav>
        <footer>Built from the product</footer>
      </aside>
      <main><button class="back">‹ Components</button><div class="canvas">${pages[active]()}</div></main>
    </div>`;

  const search = app.querySelector(".search input");
  search.addEventListener("input", () => { app.querySelector("nav").innerHTML = renderCatalog(active, search.value); });
  app.querySelector(".theme").addEventListener("click", () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  });
  app.querySelector(".back").addEventListener("click", () => document.body.classList.remove("detail-open"));
  app.querySelectorAll("nav a").forEach((link) => link.addEventListener("click", () => document.body.classList.add("detail-open")));
}

addEventListener("hashchange", render);
render();
