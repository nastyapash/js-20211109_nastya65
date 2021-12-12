export default class SortableList {
  constructor ({items = []}) {
    this.items = items;
    this.render();
  }

  render() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');
    element.innerHTML = this.template;
    this.element = element;

    this.initialize();
  }

  get template() {
    return this.items.map(elem => {
      elem.classList.add('sortable-list__item');
      return elem.outerHTML;
    }).join('');
  }

  enableDraggingForElem = (event) => {
    if (event.target.dataset.grabHandle !== '') return;
    const listItem = event.target.closest('.sortable-list__item');

    const properties = listItem.getBoundingClientRect();
    const placeholder = this.createPlaceholder(listItem, properties);
    this.updateDraggingElem(listItem, properties);

    const shiftX = event.clientX - listItem.getBoundingClientRect().left;
    const shiftY = event.clientY - listItem.getBoundingClientRect().top;
    function moveAt(pageX, pageY) {
      listItem.style.left = pageX - shiftX + 'px';
      listItem.style.top = pageY - shiftY + 'px';
    }
    moveAt(event.pageX, event.pageY);

    document.addEventListener('pointermove', onPointerMove);
    function onPointerMove(event) {
      moveAt(event.pageX, event.pageY);
      listItem.style.display = 'none';
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      listItem.style.display = 'flex';

      if (!elemBelow) return;

      const droppableBelow = elemBelow.closest('.sortable-list__item');
      if (droppableBelow) {
        if (droppableBelow.getBoundingClientRect().top > placeholder.getBoundingClientRect().top) {
          droppableBelow.after(placeholder);
        } else {
          droppableBelow.before(placeholder);
        }
      }
    }

    document.onpointerup = function() {
      document.removeEventListener('pointermove', onPointerMove);
      document.onpointerup = null;
      listItem.classList.remove('sortable-list__item_dragging');
      listItem.style = ''
      placeholder.before(listItem)
      placeholder.remove();
    };
  }

  createPlaceholder(listItem, properties) {
    const placeholder = document.createElement('li');
    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = properties.width + 'px';
    placeholder.style.height = properties.height + 'px';
    listItem.before(placeholder);
    return placeholder;
  }

  updateDraggingElem(listItem, properties) {
    listItem.classList.add('sortable-list__item_dragging');
    listItem.style.width = properties.width + 'px';
    listItem.style.top = properties.top + 'px';
    listItem.style.left = properties.left + 'px';
    this.element.append(listItem);
  }

  deleteElem(event) {
    if (event.target.dataset.deleteHandle !== '') return;
    const listItem = event.target.closest('.sortable-list__item');
    listItem.remove();
  }

  initialize() {
    document.addEventListener('pointerdown', this.enableDraggingForElem);
    document.ondragstart = () => false;
    document.addEventListener('pointerdown', this.deleteElem);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.enableDraggingForElem);
    document.removeEventListener('pointerdown', this.deleteElem);
    this.element = null;
  }
}
