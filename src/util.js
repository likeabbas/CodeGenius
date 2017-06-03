/**
 * @author Anthony Altieri on 5/20/17.
 */

const create = (document) => (tag) => document.createElement(tag);

const div = (document) => () => document.createElement('div');
const p = (document) => () => document.createElement('p');

function injectStyle(element, style) {
  Object.keys(style)
    .forEach((key) => { element[key] = style[key] });
  return this;
}

function addClasses(element, classes) {
  classes.forEach((c) => { element.classList.add(c) });
  return this;
}

function removeClasses(element, classes) {
  classes.forEach((c) => { element.classList.remove(c) });
  return this;
}

function appendChildren(element, children) {
  children.forEach((child) => {
    element.appendChild(child);
  });
  return this;
}

export default (document) => {
  const self = {
    create: create(document).bind(self),
    div: div(document).bind(self),
    p: div(document).bind(self),
    injectStyle: injectStyle.bind(self),
    addClasses: addClasses.bind(self),
    removeClasses: removeClasses.bind(self),
    appendChildren: appendChildren.bind(self),
  };
  return self;
}
