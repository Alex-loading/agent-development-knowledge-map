export class FakeEvent {
  constructor(type) {
    this.type = type;
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

export class FakeNode {
  constructor(ownerDocument = null) {
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.childNodes = [];
    this._text = '';
  }

  get textContent() {
    return this._text + this.childNodes.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    this._text = String(value ?? '');
    this.childNodes = [];
  }

  append(...children) {
    for (const child of children) {
      const node = child instanceof FakeNode
        ? child
        : this.ownerDocument.createTextNode(String(child));
      node.parentNode = this;
      this.childNodes.push(node);
    }
  }

  replaceChildren(...children) {
    const activeElement = this.ownerDocument?.activeElement;
    const removesActiveElement = activeElement && this.childNodes.some((child) => (
      child === activeElement || descendants(child).includes(activeElement)
    ));
    for (const child of this.childNodes) child.parentNode = null;
    this.childNodes = [];
    this._text = '';
    this.append(...children);
    if (removesActiveElement) this.ownerDocument.activeElement = this.ownerDocument.body ?? null;
  }
}

class FakeText extends FakeNode {
  constructor(text, ownerDocument) {
    super(ownerDocument);
    this._text = String(text);
  }
}

function descendants(node) {
  const result = [];
  for (const child of node.childNodes) {
    if (child instanceof FakeElement) {
      result.push(child, ...descendants(child));
    }
  }
  return result;
}

function matchesSimple(node, selector) {
  let rest = selector;
  const checked = rest.endsWith(':checked');
  if (checked) rest = rest.slice(0, -8);

  const attributes = [...rest.matchAll(/\[([^=\]]+)=["']([^"']*)["']\]/g)];
  rest = rest.replace(/\[[^\]]+\]/g, '');

  let matches = true;
  if (rest.startsWith('#')) matches = node.id === rest.slice(1);
  else if (rest.startsWith('.')) matches = node.className.split(/\s+/).includes(rest.slice(1));
  else if (rest) matches = node.tagName.toLowerCase() === rest.toLowerCase();

  for (const attribute of attributes) {
    matches = matches && node.getAttribute(attribute[1]) === attribute[2];
  }
  if (checked) matches = matches && node.checked === true;
  return matches;
}

function matchesSelector(node, selector) {
  const parts = selector.trim().split(/\s+/);
  if (!matchesSimple(node, parts.at(-1))) return false;
  let ancestor = node.parentNode;
  for (let index = parts.length - 2; index >= 0; index -= 1) {
    while (ancestor && !(ancestor instanceof FakeElement && matchesSimple(ancestor, parts[index]))) {
      ancestor = ancestor.parentNode;
    }
    if (!ancestor) return false;
    ancestor = ancestor.parentNode;
  }
  return true;
}

export class FakeElement extends FakeNode {
  constructor(tag, ownerDocument) {
    super(ownerDocument);
    this.tagName = tag.toUpperCase();
    this.attributes = new Map();
    this.dataset = {};
    this.className = '';
    this.disabled = false;
    this.hidden = false;
    this.selected = false;
    this.checked = false;
    this.value = '';
    this.listeners = new Map();
  }

  get children() {
    return this.childNodes.filter((child) => child instanceof FakeElement);
  }

  get id() {
    return this.getAttribute('id') ?? '';
  }

  setAttribute(name, value) {
    const stringValue = String(value);
    this.attributes.set(name, stringValue);
    if (name === 'class') this.className = stringValue;
    if (['name', 'type'].includes(name)) this[name] = stringValue;
    if (name === 'value') {
      this.value = this.tagName === 'PROGRESS' ? Number(stringValue) : stringValue;
    }
    if (name === 'required') this.required = true;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }

  removeEventListener(type, callback) {
    this.listeners.get(type)?.delete(callback);
  }

  dispatchEvent(event) {
    for (const callback of this.listeners.get(event.type) ?? []) callback.call(this, event);
    return !event.defaultPrevented;
  }

  click() {
    if (!this.disabled) this.dispatchEvent(new FakeEvent('click'));
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  querySelectorAll(selector) {
    return descendants(this).filter((node) => matchesSelector(node, selector));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }
}

export class FakeDocument extends FakeNode {
  constructor() {
    super(null);
    this.ownerDocument = this;
    this.activeElement = null;
    this.title = '';
    this.body = this.createElement('body');
    this.append(this.body);
  }

  createElement(tag) {
    return new FakeElement(tag, this);
  }

  createTextNode(text) {
    return new FakeText(text, this);
  }

  querySelectorAll(selector) {
    return descendants(this).filter((node) => matchesSelector(node, selector));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }
}

export function createAppDocument() {
  const document = new FakeDocument();
  const add = (tag, id, parent = document.body) => {
    const node = document.createElement(tag);
    node.setAttribute('id', id);
    parent.append(node);
    return node;
  };

  const skipLink = add('a', 'skip-to-main');
  skipLink.setAttribute('href', '#app-main');
  const brandHome = add('a', 'brand-home');
  brandHome.setAttribute('href', '#llm-foundation/dashboard');
  add('div', 'module-list');
  add('select', 'module-select');
  add('div', 'view-tabs');
  add('strong', 'current-module-title');
  add('div', 'progress-summary');
  add('div', 'storage-notice');
  const main = add('main', 'app-main');
  add('div', 'view-root', main);
  add('div', 'app-live-region');
  return document;
}

export function createFakeWindow(initialHash = '#llm-foundation/dashboard') {
  const listeners = new Map();
  const location = { hash: initialHash };
  return {
    location,
    history: { replaceState(_state, _title, hash) { location.hash = hash; } },
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
    },
    dispatchEvent(event) {
      for (const callback of listeners.get(event.type) ?? []) callback(event);
    },
  };
}

export function installFakeDom(document) {
  const previous = { document: globalThis.document, Node: globalThis.Node };
  globalThis.document = document;
  globalThis.Node = FakeNode;
  return () => {
    if (previous.document === undefined) delete globalThis.document;
    else globalThis.document = previous.document;
    if (previous.Node === undefined) delete globalThis.Node;
    else globalThis.Node = previous.Node;
  };
}

export function findButton(root, label) {
  return root.querySelectorAll('button').find((button) => button.textContent === label) ?? null;
}
