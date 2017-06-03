/**
 * Created by abbas and anthony altieri on 5/15/17.
 */
import getUtil from './util';
import * as api from './fakeapi';
import R from 'ramda';
const utility = getUtil(document);

const COMMENT_CLASS_SELECTOR = '.pl-c';
const CONTAINER_SELECTOR = '.container.new-discussion-timeline.experiment-repo-nav';
const YELLOW_COLOR = 'rgb(248,238, 199)';
const GREY_COLOR = 'rgba(0,0,0,0.05)';
const ELEMENT_NODE = 1;
const TOP_NODE_ID = 'js-repo-pjax-container';



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

export function initDOM(anchor) {
  injectBranding(anchor);
  injectCodeCommentDiv(anchor);
  injectCommentsDiv(anchor);
}

export function configureContainer() {
  const topNode = document.querySelector(`#${TOP_NODE_ID}`);
  const div = document.createElement('div');
  div.classList.add('flybyWrapper');
  topNode.appendChild(div);
  const container = document.querySelector(CONTAINER_SELECTOR);
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





