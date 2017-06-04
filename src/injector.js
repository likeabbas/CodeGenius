/**
 * Created by abbas and anthony altieri on 5/15/17.
 */
import getUtil from './util';
import R from 'ramda';
const utility = getUtil(document);

const COMMENT_CLASS_SELECTOR = '.pl-c';
export const CONTAINER_SELECTOR = '.container.new-discussion-timeline.experiment-repo-nav';
const YELLOW_COLOR = 'rgb(248,238, 199)';
const GREY_COLOR = 'rgba(0,0,0,0.05)';
const ELEMENT_NODE = 1;
const TOP_NODE_ID = 'js-repo-pjax-container';
export const PAGEHEAD_SELECTOR = '.pagehead';



export function init() {
  Promise.all([deleteElements(), getLinesWithCode()])
    .then(([commentLines, codeLines]) => {
      const codeLinesToComments = matchCodeLinesToComments(commentLines, codeLines);
      injectLineHighlights(Object.keys(codeLinesToComments));
      printCommentsOnClick(codeLinesToComments);
      const anchor = configureContainer();
      injectBranding(anchor);
    });
}

export function getLineNumberFromSpan(span) {
  if (span === null || span.parentNode === null) return -1;
  const id = span.parentNode.getAttribute('id');
  if (id === null) return -1;
  return +(id.substring(2))
}

// TODO: Handle case where no code content after comments (trailing comments)
export function matchCodeLinesToComments(commentLines, codeLines) {
  let codeLinesToComments = {};
  for (let i = 0 ; i < commentLines.length ; i++) {
    const commentLine = commentLines[i];
    let nextCodeLine = -1;
    for (let j = 0 ; j < codeLines.length ; j++) {
      const codeLine = codeLines[j];
      if (codeLine > commentLine) {
        nextCodeLine = codeLine;
        break;
      }
    }
    if (nextCodeLine === -1) {
      console.error('problem matching code lines to comments');
      return null;
    }
    let grouping = [commentLine];
    let lastCommentIndexAdded = i;
    for (let j = i + 1; j < commentLines.length ; j++) {
      const commentLineWalker = commentLines[j];
      if (commentLineWalker < nextCodeLine) {
        grouping.push(commentLineWalker);
        lastCommentIndexAdded = j;
      }
    }
    codeLinesToComments[nextCodeLine] = grouping;
    i = lastCommentIndexAdded;
  }
  return codeLinesToComments;
}

export function injectWriteBox(anchor, picUrl) {
  const writeBoxWrapper = utility.div();
  writeBoxWrapper.setAttribute('id', 'flybyWriteBox');
  utility.addClasses(writeBoxWrapper, ['flybyWriteboxWrapper']);
  const container = utility.div();
  utility.addClasses(container, ['flybyWriteBox']);
  const heading = utility.div();
  utility.addClasses(heading, ['flybyCommentHeader']);
  const pic = utility.create('im');
  pic.src = picUrl;
  utility.addClasses(pic, ['flybyCommentPic']);
  const writeContentDiv = utility.div();
  utility.addClasses(
    writeContentDiv,
    [ 'flybyWriteBoxContainer' ]
  );
  const writeBody = utility.create('textarea');
  writeBody.setAttribute('placeholder', 'Leave a comment');
  writeBody.setAttribute('id', 'flybyWriteBoxContent');
  const commentBtn = utility.create('button');
  commentBtn.innerHTML = 'Comment';
  commentBtn.setAttribute('id', 'flybyWriteBoxCommentButton');
  utility.addClasses(commentBtn, ['btn-primary', 'btn']);
  const buttonContainer = utility.div();
  utility.addClasses(buttonContainer, ['flybyWriteBoxButtonContainer']);
  utility.appendChildren(buttonContainer, [commentBtn]);
  utility.appendChildren(writeContentDiv, [writeBody, buttonContainer]);
  utility.appendChildren(writeBoxWrapper, [pic, container]);
  utility.appendChildren(container, [writeContentDiv]);
  utility.appendChildren(anchor, [container]);
}
export function clearWriteBox() {
  const writeBox = document.getElementById('flybyWriteBox');
  writeBox.parentNode.removeChild(writeBox);
}

export function injectCodeComment(content) {
  const anchor = document.getElementById('flybyCodeComment');
  const container = utility.div();
  utility.addClasses(container, ['flybyComment']);
  const contentDiv = utility.div();
  contentDiv.innerHTML = content;
  utility.addClasses(contentDiv, ['flybyCommentContent', 'codeCommentContent']);
  utility.appendChildren(container, [contentDiv]);
  utility.appendChildren(anchor, [container]);
}

export function clearCodeComment() {
  const anchor = document.getElementById('flybyCodeComment');
  R.forEach(n => anchor.removeChild(n), anchor.children);
}


export function injectComment(username, content, picUrl) {
  const anchor = document.getElementById('flybyComments');
  const container = utility.create('div');
  utility.addClasses(container, ['flybyComment']);
  const heading = utility.create('div');
  utility.addClasses(heading, ['flybyCommentHeader']);
  const pic = utility.create('img');
  pic.src = picUrl;
  utility.addClasses(pic, ['flybyCommentPic']);
  const displayName = utility.create('p');
  displayName.innerHTML = username;
  utility.appendChildren(heading, [displayName]);
  const contentDiv = utility.create('div');
  utility.addClasses(contentDiv, ['flybyCommentContent']);
  contentDiv.innerHTML = content;
  utility.appendChildren(container, [heading, contentDiv]);
  const commentWrapper = utility.create('div');
  utility.addClasses(commentWrapper, ['flybyCommentWrapper']);
  utility.appendChildren(commentWrapper, [pic, container]);
  utility.appendChildren(anchor, [commentWrapper]);
}

export function clearComments() {
  const anchor = document.getElementById('flybyComments');
  R.forEach(n => anchor.removeChild(n), anchor.children);
}

export function injectBranding(anchor) {
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('flybyHeader');
  const flyby = document.createElement('h1');
  flyby.innerHTML = 'FlyBy';
  flyby.style.display = 'inline-block';
  const bar = document.createElement('div');
  bar.classList.add('flybyHeaderBar');
  bar.appendChild(flyby);
  const tagline = document.createElement('p');
  tagline.innerHTML = 'Agile code review';
  headerDiv.appendChild(bar);
  headerDiv.appendChild(tagline);
  anchor.append(headerDiv);
}

function injectCommentsDiv(anchor) {
  const commentsDiv = utility.div();
  commentsDiv.setAttribute('id', 'flybyComments');
  anchor.appendChild(commentsDiv);
}
function injectCodeCommentDiv(anchor) {
  const codeCommentsDiv = utility.div();
  codeCommentsDiv.setAttribute('id', 'flybyCodeComment');
  anchor.appendChild(codeCommentsDiv);
}

const SIDEBAR_SHOWING = true;
const SIDEBAR_HIDDLEN = false;

export function initDOM(anchor) {

  const pagehead = document.querySelector(PAGEHEAD_SELECTOR);
  pagehead.classList.add('pagehead-showing');

  const header = document.getElementsByClassName('header')[0];
  header.classList.add('header-showing');

  const flybyIconWrapper = document.createElement('div');
  const flybyIcon = document.createElement('img');
  flybyIcon.classList.add('flybyIcon');
  flybyIcon.src = chrome.runtime.getURL('img/flyby.svg');
  flybyIconWrapper.appendChild(flybyIcon);
  flybyIconWrapper.classList.add('flybyIconWrapper');
  flybyIconWrapper.classList.add('noselect');
  document.getElementsByClassName('user-nav')[0].appendChild(flybyIconWrapper);



  const main = document.querySelector('div[role=main]');
  main.classList.add('main-showing');
  const container = document.querySelector(CONTAINER_SELECTOR);
  const minimizer = document.createElement('div');
  minimizer.classList.add('flybyMinimizer');
  minimizer.innerHTML = 'Hide';
  minimizer.onclick = () => {
    if (isSidebarShowing()) {
      hideSidebar(main, container, header, pagehead);
    } else {
      showSidebar(main, container, header, pagehead);
    }
  };
  flybyIconWrapper.onclick = () => {
    if (!isSidebarShowing()) {
      showSidebar(main, container, header, pagehead);
    }
  };
  console.log("minimizer", minimizer);
  console.log("minimizer.onclick", minimizer.onclick);
  const wrapper = document.createElement('div');
  wrapper.classList.add('flybyAnchorWrapper');
  wrapper.appendChild(minimizer);
  anchor.appendChild(wrapper);
  injectBranding(wrapper);
  injectCodeCommentDiv(wrapper);
  injectCommentsDiv(wrapper);
  modifyHeader(SIDEBAR_SHOWING)
}



export function isSidebarShowing() {
  const anchor = document.getElementById('anchor');
  return !anchor.classList.contains('anchor-hide');
}

export function showSidebar(main, container, header, pagehead) {
  const anchor = document.getElementById('anchor');
  anchor.classList.remove('anchor-hide');
  main.classList.add('main-showing');
  container.classList.add('container-showing');
  header.classList.add('header-showing');
  pagehead.classList.add('pagehead-showing');
  modifyHeader(SIDEBAR_SHOWING);
}

export function hideSidebar(main, container, header, pagehead) {
  console.log('hideSidebar()');
  const anchor = document.getElementById('anchor');
  anchor.classList.add('anchor-hide');
  main.classList.remove('main-showing');
  container.classList.remove('container-showing');
  header.classList.remove('header-showing');
  pagehead.classList.remove('pagehead-showing');
  modifyHeader(SIDEBAR_HIDDLEN);
}

export function modifyHeader(isSidebarShowing) {
  const header = document.getElementsByClassName('header')[0];

  if (isSidebarShowing) {
    header.classList.add('header-showing');
  } else {
    header.classList.remove('header-showing');
  }
}

export function configureContainer() {
  const topNode = document.querySelector(`#${TOP_NODE_ID}`);
  const div = document.createElement('div');
  div.classList.add('flybyWrapper');
  topNode.appendChild(div);
  const container = document.querySelector(CONTAINER_SELECTOR);
  container.classList.add('container-showing');
  div.appendChild(container);
  const flybyAnchor = document.createElement('div');
  flybyAnchor.id = 'anchor';
  div.appendChild(flybyAnchor);
  return flybyAnchor;
}

export function printCommentsOnClick(codeLinesToComments) {
  Object.keys(codeLinesToComments)
    .forEach((lineNumber) => {
      document.getElementById(`LCutility{lineNumber}`).onclick = () => {
        console.log(codeLinesToComments[lineNumber])
      }

    })
}

export const CLASS_FLYBY_HIGHLIGHT = 'flybyHighlight';

export function injectLineHighlights() {
  document.querySelector('head').innerHTML += `
    <style>
      .flybyHighlight{
        background-color: ${GREY_COLOR};
        cursor: pointer;
      }
      .flybyHighlight:hover {
        background-color: ${YELLOW_COLOR};
      }
      .flybySelected {
        background-color: ${YELLOW_COLOR};
      }
    </style>
  `
}

function stringToNumber(string) {
  return +string;
}

// Chrome pre-34
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.webkitMatchesSelector;
}

function clearNonEssential(anchor) {
  while (anchor.children.length > 2) {
    anchor.removeChild(anchor.children[2]);
  }
}


export default {
  configureContainer,
  matchCodeLinesToComments,
  injectComment,
  injectBranding,
  injectWriteBox,
  injectLineHighlights,
  injectCodeComment,
  clearNonEssential,
  CLASS_FLYBY_HIGHLIGHT,
  initDOM,
}





