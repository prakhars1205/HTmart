// Loads content/site.json at runtime and fills in any element marked
// with a data-cms attribute. This lets the admin panel (/admin) edit
// text, images, and videos without touching the page code.
//
// Usage in HTML:
//   <h1 data-cms="hero.heading_line1"></h1>            -> sets textContent
//   <img data-cms="logo" data-cms-attr="src">          -> sets the given attribute
//   <div data-cms-repeat="services" data-cms-template="#service-card-template"></div>
//
// Path syntax: dot-separated keys into site.json, e.g. "hero.description".

(function () {
  function getValue(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  }

  function applySingle(el, data) {
    const path = el.getAttribute('data-cms');
    const value = getValue(data, path);
    if (value == null) return;

    const attr = el.getAttribute('data-cms-attr');
    if (attr) {
      el.setAttribute(attr, value);
    } else {
      el.textContent = value;
    }
  }

  function applyRepeat(el, data) {
    const path = el.getAttribute('data-cms-repeat');
    const templateSelector = el.getAttribute('data-cms-template');
    const items = getValue(data, path);
    const template = document.querySelector(templateSelector);
    if (!Array.isArray(items) || !template) return;

    el.innerHTML = '';
    items.forEach((item) => {
      const node = template.content.cloneNode(true);
      node.querySelectorAll('[data-cms-field]').forEach((field) => {
        const fieldPath = field.getAttribute('data-cms-field');
        const value = getValue(item, fieldPath);
        if (value == null) return;
        const attr = field.getAttribute('data-cms-attr');
        if (attr) {
          field.setAttribute(attr, value);
        } else {
          field.textContent = value;
        }
      });
      el.appendChild(node);
    });
  }

  function applyContent(data) {
    document.querySelectorAll('[data-cms]').forEach((el) => applySingle(el, data));
    document.querySelectorAll('[data-cms-repeat]').forEach((el) => applyRepeat(el, data));
  }

  fetch('/content/site.json')
    .then((res) => res.json())
    .then(applyContent)
    .catch((err) => console.error('Could not load site content:', err));
})();
