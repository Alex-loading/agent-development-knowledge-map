const SAFE_PROTOCOL = 'https:';

function appendChild(parent, child) {
  if (child === null || child === undefined || child === false) return;
  parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
}

export function element(tag, options = {}, children = []) {
  const node = document.createElement(tag);

  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = String(options.text);

  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    if (/^on/i.test(name) || value === null || value === undefined || value === false) continue;
    node.setAttribute(name, value === true ? '' : String(value));
  }

  for (const [name, value] of Object.entries(options.dataset ?? {})) {
    if (value !== null && value !== undefined) node.dataset[name] = String(value);
  }

  for (const [eventName, callback] of Object.entries(options.events ?? {})) {
    if (typeof callback === 'function') node.addEventListener(eventName, callback);
  }

  const childList = Array.isArray(children) ? children : [children];
  childList.forEach((child) => appendChild(node, child));
  return node;
}

export function button(label, options = {}) {
  const {
    type = 'button', disabled = false, className, attrs, dataset, events,
  } = options;

  const node = element('button', {
    className,
    text: label,
    attrs: { ...attrs, type },
    dataset,
    events,
  });
  node.disabled = disabled;
  return node;
}

export function externalLink(resource = {}) {
  let url;
  try {
    url = new URL(resource.url);
  } catch {
    return element('span', {
      className: 'external-link external-link--disabled',
      text: resource.title ?? '无效资源',
      attrs: { 'aria-disabled': 'true' },
    });
  }

  if (url.protocol !== SAFE_PROTOCOL) {
    return element('span', {
      className: 'external-link external-link--disabled',
      text: resource.title ?? url.hostname,
      attrs: { 'aria-disabled': 'true' },
    });
  }

  return element('a', {
    className: 'external-link',
    text: resource.title ?? url.hostname,
    attrs: { href: url.href, target: '_blank', rel: 'noopener noreferrer' },
  });
}
