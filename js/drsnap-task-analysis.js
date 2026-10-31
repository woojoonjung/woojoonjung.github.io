import { taskAnalysisTree } from './drsnap-task-analysis-data.js';

// Execution order belongs in each card's plan. These connectors show hierarchy.
const CARD_WIDTH = 280;
const ROW_GAP = 80;
const SUBTREE_GAP = 36;
const CANVAS_PADDING = 48;
const MIN_SCALE = 0.01;
const MAX_SCALE = 1.5;
const SVG_NS = 'http://www.w3.org/2000/svg';

function initializeTaskAnalysis(wrapper) {
  const viewport = wrapper.querySelector('[data-tree-viewport]');
  const spacer = wrapper.querySelector('[data-tree-spacer]');
  const world = wrapper.querySelector('[data-tree-world]');
  const details = wrapper.closest('details');
  if (!viewport || !spacer || !world) return;

  const slider = wrapper.querySelector('[data-tree-zoom]');
  const zoomLabel = wrapper.querySelector('[data-tree-zoom-label]');
  const zoomOut = wrapper.querySelector('[data-tree-action="zoom-out"]');
  const zoomIn = wrapper.querySelector('[data-tree-action="zoom-in"]');
  const nodes = new Map();
  let scale = 1;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let offsetX = 0;
  let offsetY = 0;
  let rendered = false;
  let rendering = false;
  let resizeFrame = 0;
  let lastViewportWidth = 0;
  let lastViewportHeight = 0;
  let selectedCard = null;
  let rootModel = null;
  let drag = null;
  let lastPointerAnchor = null;
  let gesture = null;
  let ignorePinchWheelUntil = 0;

  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('data-lenis-prevent', '');
  if (!viewport.hasAttribute('aria-label')) {
    viewport.setAttribute('aria-label', 'Task analysis diagram. Scroll horizontally and vertically to explore the tree.');
  }
  spacer.style.position = 'relative';
  // The unscaled world must not extend the scrollable area beyond its scaled size.
  spacer.style.overflow = 'hidden';
  world.style.position = 'absolute';
  world.style.transformOrigin = '0 0';

  if (slider) {
    slider.min = String(MIN_SCALE * 100);
    slider.max = '150';
    slider.step = '1';
  }

  const edges = document.createElementNS(SVG_NS, 'svg');
  edges.classList.add('ds-task-tree__edges');
  edges.setAttribute('aria-hidden', 'true');
  edges.setAttribute('focusable', 'false');

  function paragraph(className, text, fieldLabel) {
    const element = document.createElement('p');
    element.className = className;
    if (fieldLabel) {
      const label = document.createElement('span');
      label.className = 'ds-task-tree__field-label';
      label.textContent = fieldLabel;
      element.append(label, document.createTextNode(text));
    } else {
      element.textContent = text;
    }
    return element;
  }

  function buildNode(data, depth, list, parent = null) {
    if (!data || !data.id || nodes.has(data.id)) {
      throw new Error('Task analysis nodes must have unique IDs.');
    }
    const item = document.createElement('li');
    item.className = 'ds-task-tree__item';
    const card = document.createElement('article');
    card.className = 'ds-task-tree__node';
    card.dataset.treeNodeId = data.id;
    card.tabIndex = -1;
    card.style.width = `${CARD_WIDTH}px`;
    card.style.position = 'absolute';
    card.style.boxSizing = 'border-box';
    if (data.status) card.classList.add(`ds-task-tree__node--${data.status}`);

    const label = paragraph('ds-task-tree__label', data.label || '');
    label.id = `task-tree-${data.id}-label`;
    const title = document.createElement('h4');
    title.id = `task-tree-${data.id}-title`;
    title.textContent = data.title;
    card.setAttribute('aria-labelledby', `${label.id} ${title.id}`);
    card.append(label, title);
    if (data.body) card.append(paragraph('ds-task-tree__body', data.body));
    if (data.plan) card.append(paragraph('ds-task-tree__plan', data.plan, 'Plan'));
    if (data.insight) card.append(paragraph('ds-task-tree__insight', data.insight, 'Potential friction'));
    if (data.requirement) card.append(paragraph('ds-task-tree__requirement', data.requirement, 'Design requirement'));
    item.append(card);
    list.append(item);

    const model = { data, card, depth, parent, children: [], childrenList: null,
      toggle: null, expanded: true, height: 0, extent: 0, x: 0, y: 0 };
    nodes.set(data.id, model);
    if (data.children && data.children.length) {
      const childrenList = document.createElement('ol');
      childrenList.className = 'ds-task-tree__list';
      childrenList.id = `task-tree-${data.id}-children`;
      item.append(childrenList);
      model.childrenList = childrenList;
      model.children = data.children.map(child => buildNode(child, depth + 1, childrenList, model));
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'ds-task-tree__toggle';
      toggle.dataset.treeToggle = data.id;
      toggle.setAttribute('aria-controls', childrenList.id);
      toggle.setAttribute('aria-expanded', 'true');
      toggle.textContent = 'Hide subtasks';
      card.append(toggle);
      model.toggle = toggle;
    }
    return model;
  }

  function visibleChildren(model) {
    return model.expanded ? model.children : [];
  }

  function setExpanded(model, expanded) {
    if (!model.childrenList) return;
    model.expanded = expanded;
    model.childrenList.hidden = !expanded;
    // Explicit display prevents a site's list reset from overriding [hidden].
    model.childrenList.style.display = expanded ? '' : 'none';
    model.toggle.setAttribute('aria-expanded', String(expanded));
    model.toggle.textContent = expanded ? 'Hide subtasks' : `Show ${model.children.length} subtask${model.children.length === 1 ? '' : 's'}`;
  }

  function measure(model) {
    model.height = Math.ceil(model.card.offsetHeight);
    const children = visibleChildren(model);
    const childrenExtent = children.reduce((total, child) => total + measure(child), 0)
      + Math.max(0, children.length - 1) * SUBTREE_GAP;
    model.extent = Math.max(CARD_WIDTH, childrenExtent);
    return model.extent;
  }

  function position(model, left, top) {
    model.x = left + (model.extent - CARD_WIDTH) / 2;
    model.y = top;
    model.card.style.left = `${model.x}px`;
    model.card.style.top = `${model.y}px`;
    const children = visibleChildren(model);
    const childrenExtent = children.reduce((total, child) => total + child.extent, 0)
      + Math.max(0, children.length - 1) * SUBTREE_GAP;
    let childLeft = left + (model.extent - childrenExtent) / 2;
    children.forEach(child => {
      position(child, childLeft, top + model.height + ROW_GAP);
      childLeft += child.extent + SUBTREE_GAP;
    });
  }

  function drawConnections(model) {
    visibleChildren(model).forEach(child => {
      const startX = model.x + CARD_WIDTH / 2;
      const startY = model.y + model.height;
      const endX = child.x + CARD_WIDTH / 2;
      const endY = child.y;
      const joinY = endY - ROW_GAP / 2;
      const edge = document.createElementNS(SVG_NS, 'path');
      edge.classList.add('ds-task-tree__edge');
      if (model.data.status === 'decision' || child.data.status === 'decision') {
        edge.classList.add('ds-task-tree__edge--synthesis');
      }
      edge.setAttribute('d', `M ${startX} ${startY} V ${joinY} H ${endX} V ${endY}`);
      edges.append(edge);
      drawConnections(child);
    });
  }

  function layout(preserveModel) {
    if (!rootModel) return;
    const anchor = preserveModel ? {
      x: preserveModel.x * scale + offsetX - viewport.scrollLeft,
      y: preserveModel.y * scale + offsetY - viewport.scrollTop,
    } : null;
    measure(rootModel);
    position(rootModel, CANVAS_PADDING, CANVAS_PADDING);
    canvasWidth = CANVAS_PADDING * 2 + rootModel.extent;
    const bottomOf = model => Math.max(model.y + model.height, ...visibleChildren(model).map(bottomOf));
    canvasHeight = bottomOf(rootModel) + CANVAS_PADDING;
    world.style.width = `${canvasWidth}px`;
    world.style.height = `${canvasHeight}px`;
    edges.setAttribute('width', String(canvasWidth));
    edges.setAttribute('height', String(canvasHeight));
    edges.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
    edges.replaceChildren();
    drawConnections(rootModel);
    if (rendered) applyGeometry();
    if (anchor) {
      viewport.scrollLeft = preserveModel.x * scale + offsetX - anchor.x;
      viewport.scrollTop = preserveModel.y * scale + offsetY - anchor.y;
    }
  }

  function updateControls() {
    const percent = Math.round(scale * 100);
    if (slider) {
      // A very tall tree may need an overview below the normal manual minimum.
      slider.min = String(Math.min(MIN_SCALE * 100, percent));
      slider.value = String(percent);
      slider.setAttribute('aria-valuetext', `${percent} percent`);
    }
    if (zoomLabel) zoomLabel.textContent = `${percent}%`;
    if (zoomOut) zoomOut.disabled = scale <= 0.25;
    if (zoomIn) zoomIn.disabled = scale >= MAX_SCALE;
  }

  function applyGeometry() {
    const width = Math.max(viewport.clientWidth, Math.ceil(canvasWidth * scale));
    const height = Math.max(viewport.clientHeight, Math.ceil(canvasHeight * scale));
    offsetX = Math.max(0, (width - canvasWidth * scale) / 2);
    offsetY = Math.max(0, (height - canvasHeight * scale) / 2);
    spacer.style.width = `${width}px`;
    spacer.style.height = `${height}px`;
    world.style.left = `${offsetX}px`;
    world.style.top = `${offsetY}px`;
    world.style.transform = `scale(${scale})`;
    lastViewportWidth = viewport.clientWidth;
    lastViewportHeight = viewport.clientHeight;
    updateControls();
  }

  function overviewScale() {
    return Math.min(1,
      Math.min((viewport.clientWidth - 24) / canvasWidth, (viewport.clientHeight - 24) / canvasHeight));
  }

  function setScale(nextScale, anchor) {
    if (!rendered || !Number.isFinite(nextScale) || nextScale <= 0) return;
    const anchorX = anchor ? anchor.x : viewport.clientWidth / 2;
    const anchorY = anchor ? anchor.y : viewport.clientHeight / 2;
    const worldX = (viewport.scrollLeft + anchorX - offsetX) / scale;
    const worldY = (viewport.scrollTop + anchorY - offsetY) / scale;
    // Use a stable fit-based floor: even a tiny overview can zoom in and then
    // back out without the previous scale becoming an accidental new minimum.
    const minimumScale = Math.min(MIN_SCALE, overviewScale());
    scale = Math.min(MAX_SCALE, Math.max(minimumScale, nextScale));
    applyGeometry();
    viewport.scrollLeft = worldX * scale + offsetX - anchorX;
    viewport.scrollTop = worldY * scale + offsetY - anchorY;
  }

  function fitOverview() {
    if (!rendered) return;
    scale = overviewScale();
    applyGeometry();
    viewport.scrollLeft = Math.max(0, (spacer.offsetWidth - viewport.clientWidth) / 2);
    viewport.scrollTop = 0;
  }

  function focusNode(id) {
    const model = nodes.get(id);
    if (!model || !rendered) return;
    // A branch shortcut presents one useful level of detail, while keeping
    // the complete tree in the DOM and preserving its ancestors as context.
    nodes.forEach(node => setExpanded(node, false));
    for (let ancestor = model.parent; ancestor; ancestor = ancestor.parent) {
      setExpanded(ancestor, true);
    }
    setExpanded(model, true);
    model.children.forEach(child => setExpanded(child, false));
    layout();
    if (scale < 0.75) setScale(0.75);
    viewport.scrollLeft = (model.x + CARD_WIDTH / 2) * scale + offsetX - viewport.clientWidth / 2;
    // Place the selected task near the top so its children remain in view.
    viewport.scrollTop = model.y * scale + offsetY - 60;
    if (selectedCard) selectedCard.classList.remove('is-highlighted');
    selectedCard = model.card;
    selectedCard.classList.add('is-highlighted');
    selectedCard.focus({ preventScroll: true });
  }

  async function render() {
    if (rendered || rendering || (details && !details.open) || !viewport.clientWidth) return;
    rendering = true;
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      if ((details && !details.open) || !viewport.clientWidth) return;
      const list = document.createElement('ol');
      list.className = 'ds-task-tree__list ds-task-tree__list--root';
      rootModel = buildNode(taskAnalysisTree, 0, list);
      world.replaceChildren(edges, list);
      layout();
      rendered = true;
      wrapper.classList.remove('has-error');
      wrapper.classList.add('is-ready');
      // Show the whole hierarchy first; branch shortcuts restore readable text.
      fitOverview();
    } catch (error) {
      // Leave the readable HTML fallback available when the diagram cannot load.
      rendered = false;
      wrapper.classList.remove('is-ready');
      wrapper.classList.add('has-error');
      rootModel = null;
      nodes.clear();
      edges.replaceChildren();
      world.replaceChildren();
      console.error('Unable to display the task analysis diagram.', error);
    } finally {
      rendering = false;
    }
  }

  wrapper.addEventListener('click', event => {
    const action = event.target.closest('[data-tree-action]');
    const destination = event.target.closest('[data-tree-focus]');
    const toggle = event.target.closest('[data-tree-toggle]');
    if (toggle && wrapper.contains(toggle) && rendered) {
      const model = nodes.get(toggle.dataset.treeToggle);
      if (model) {
        setExpanded(model, !model.expanded);
        layout(model);
      }
    } else if (action && wrapper.contains(action)) {
      switch (action.dataset.treeAction) {
        case 'zoom-in': setScale(Math.min(MAX_SCALE, (Math.floor(scale * 4 + 0.001) + 1) / 4)); break;
        case 'zoom-out': setScale(Math.max(0.25, (Math.ceil(scale * 4 - 0.001) - 1) / 4)); break;
        case 'fit': fitOverview(); break;
        case 'reset': setScale(1); break;
        case 'expand-all':
          nodes.forEach(model => setExpanded(model, true));
          layout();
          fitOverview();
          break;
        default: break;
      }
    } else if (destination && wrapper.contains(destination)) {
      focusNode(destination.dataset.treeFocus);
    }
  });
  if (slider) slider.addEventListener('input', () => setScale(Number(slider.value) / 100));

  function zoomAnchor(event) {
    const rect = viewport.getBoundingClientRect();
    const x = event.clientX - rect.left - viewport.clientLeft;
    const y = event.clientY - rect.top - viewport.clientTop;
    if (Number.isFinite(x) && Number.isFinite(y)
      && x >= 0 && x <= viewport.clientWidth && y >= 0 && y <= viewport.clientHeight) {
      lastPointerAnchor = { x, y };
    }
    // Some Safari GestureEvents omit pointer coordinates; use the last known
    // canvas position, or its center before the pointer has been observed.
    return lastPointerAnchor || { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
  }

  // Chromium/Firefox expose trackpad pinch as ctrl+wheel. Cancel only that
  // canvas-local gesture; ordinary wheel and two-finger scrolling stay native.
  viewport.addEventListener('wheel', event => {
    if (!rendered || !event.ctrlKey || !Number.isFinite(event.deltaY)) return;
    event.preventDefault();
    if (gesture || performance.now() < ignorePinchWheelUntil) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    const delta = Math.max(-100, Math.min(100, event.deltaY * unit));
    setScale(scale * Math.exp(-delta * 0.01), zoomAnchor(event));
  }, { passive: false });

  // Safari supplies cumulative GestureEvent.scale instead. While it owns the
  // pinch, ignore ctrl+wheel duplicates rather than applying the same zoom twice.
  viewport.addEventListener('gesturestart', event => {
    if (!rendered) return;
    event.preventDefault();
    gesture = { eventScale: 1, anchor: zoomAnchor(event) };
  }, { passive: false });
  viewport.addEventListener('gesturechange', event => {
    if (!gesture || !Number.isFinite(event.scale) || event.scale <= 0) return;
    event.preventDefault();
    setScale(scale * event.scale / gesture.eventScale, gesture.anchor);
    gesture.eventScale = event.scale;
  }, { passive: false });
  viewport.addEventListener('gestureend', event => {
    if (!gesture) return;
    event.preventDefault();
    gesture = null;
    ignorePinchWheelUntil = performance.now() + 120;
  }, { passive: false });

  // Drag only empty space with a mouse. Text selection, touch, native scroll,
  // and keyboard scroll stay intact; pinch zoom is handled within this canvas.
  viewport.addEventListener('pointerdown', event => {
    if (!rendered || event.pointerType !== 'mouse' || event.button !== 0
      || event.target.closest('.ds-task-tree__node')) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    viewport.focus({ preventScroll: true });
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    zoomAnchor(event);
    if (!drag || drag.id !== event.pointerId) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  });
  function stopDragging(event) {
    if (!drag || drag.id !== event.pointerId) return;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    drag = null;
    viewport.classList.remove('is-dragging');
  }
  viewport.addEventListener('pointerup', stopDragging);
  viewport.addEventListener('pointercancel', stopDragging);
  viewport.addEventListener('lostpointercapture', stopDragging);

  if (details) details.addEventListener('toggle', () => {
    if (details.open) render();
    else gesture = null;
  });
  window.addEventListener('blur', () => { gesture = null; });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        if (!wrapper.isConnected) {
          observer.disconnect();
          return;
        }
        if ((details && !details.open) || !viewport.clientWidth) return;
        if (!rendered) {
          render();
        } else if (viewport.clientWidth !== lastViewportWidth || viewport.clientHeight !== lastViewportHeight) {
          const left = viewport.scrollLeft;
          const top = viewport.scrollTop;
          applyGeometry();
          // Do not refit or send readers back to the beginning after resizing.
          viewport.scrollLeft = left;
          viewport.scrollTop = top;
        }
      });
    });
    observer.observe(viewport);
  }
  render();
}

document.querySelectorAll('[data-task-analysis]').forEach(initializeTaskAnalysis);
