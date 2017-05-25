/**
 * Created by abbas and anthony altieri on 5/15/17.
 */
import getUtil from './util';
import * as api from './fakeapi';
const utility = getUtil(document);

const COMMENT_CLASS_SELECTOR = '.pl-c';
const CONTAINER_SELECTOR = '.container.new-discussion-timeline.experiment-repo-nav';
const YELLOW_COLOR = 'rgb(248,238, 199)';
const GREY_COLOR = 'rgba(0,0,0,0.05)';
const ELEMENT_NODE = 1;
const TOP_NODE_ID = 'js-repo-pjax-container';



function init() {
  console.log('init()');
  Promise.all([deleteElements(), getLinesWithCode()])
    .then(([commentLines, codeLines]) => {
      const codeLinesToComments = matchCodeLinesToComments(commentLines, codeLines);
      injectLineHighlights(Object.keys(codeLinesToComments));
      printCommentsOnClick(codeLinesToComments);
      const anchor = configureContainer();
      injectBranding(anchor);
      const comments = api.getComments(window.location.toString());
      comments.forEach(c => injectComment(anchor, c.username, c.content, c.picUrl));
    });
}

function getLineNumberFromSpan(span) {
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
    [
      'write-content',
      'js-write-bucket' ,
      'js-uploadable-container',
      'js-upload-markdown-image',
      'is-default upload-enabled'
    ]
  );
  const writeBody = utility.create('textarea');
  utility.addClasses(writeBody, ['previewable-comment-form']);
  utility.appendChildren(writeContentDiv, [writeBody]);
  utility.appendChildren(writeBoxWrapper, [pic, container]);
  utility.appendChildren(container, [writeContentDiv]);
  utility.appendChildren(anchor, [container]);
}

export function injectCodeComment(anchor, content) {
  const container = utility.div();
  utility.addClasses(container, ['flybyComment']);
  const contentDiv = utility.div();
  contentDiv.innerHTML = content;
  utility.addClasses(contentDiv, ['flybyCommentContent', 'codeCommentContent']);
  utility.appendChildren(container, [contentDiv]);
  utility.appendChildren(anchor, [container]);
}


export function injectComment(anchor, username, content, picUrl) {
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
  const bar = document.createElement('div');
  bar.classList.add('flybyHeaderBar');
  const poweredBy = document.createElement('h3');
  poweredBy.innerHTML = 'Powered by';
  poweredBy.style.display = 'inline-block';
  poweredBy.style.fontSize = '14px';
  bar.appendChild(poweredBy)
  const flyby = document.createElement('h1');
  flyby.innerHTML = 'FlyBy';
  flyby.style.display = 'inline-block';
  const tagline = document.createElement('p');
  tagline.innerHTML = 'Agile code review';
  headerDiv.appendChild(bar);
  headerDiv.appendChild(flyby);
  headerDiv.appendChild(tagline);
  anchor.append(headerDiv);
}

function configureContainer() {
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

function printCommentsOnClick(codeLinesToComments) {
  Object.keys(codeLinesToComments)
    .forEach((lineNumber) => {
      document.getElementById(`LCutility{lineNumber}`).onclick = () => {
        console.log(codeLinesToComments[lineNumber])
      }

    })
}

export function injectLineHighlights(lineNumbers, lineNodes) {
  const styleLines = (
    `.flybyHighlight{ 
          background-color: ${GREY_COLOR};
          cursor: pointer;
     }
     .flybyHighlight:hover {
          background-color: ${YELLOW_COLOR};
     }
    `
  );
  lineNodes.forEach(n => { n.classList.add('flybyHighlight') });
  document.querySelector('head').innerHTML += '<style>' +
    styleLines + '</style>';
}

function stringToNumber(string) {
  return +string;
}

function getLinesWithCode() {
  return new Promise((res, rej) => {
    let codeLines = {};
    getLines(document.querySelectorAll(CODE_LINE_SELECTOR));
    const mo = new MutationObserver(process);
    mo.observe(document, { subtree: true, childList: true });
    document.addEventListener('DOMContentLoaded', () => {
      res(Object.keys(codeLines).map(stringToNumber));
      mo.disconnect()
    });

    function process(mutations) {
      for (let i = 0 ; i < mutations.length ; i++) {
        const nodes = mutations[i].addedNodes;
        for (let j = 0 ; j < nodes.length ; j++) {
          const currentNode = nodes[j];
          if (currentNode.nodeType != ELEMENT_NODE) {
            continue;
          }
          const nodeList = currentNode.matches(CODE_LINE_SELECTOR)
            ? [currentNode]
            : currentNode.querySelectorAll(CODE_LINE_SELECTOR);
          getLines(nodeList);
        }
      }
    }

    function getLines(nodes) {
      [].forEach.call(nodes, (node) => {
        if (node.childNodes.length > 1) {
          codeLines[+node.getAttribute('id').substring(2)] = true;
        }
      })
    }

  })
}

function deleteElements() {
  return new Promise((res, rej) => {
    let commentLines = [];

    doDelete(document.querySelectorAll(COMMENT_CLASS_SELECTOR));

    const mo = new MutationObserver(process);
    mo.observe(document, { subtree: true, childList: true });
    document.addEventListener('DOMContentLoaded', function() {
      res(commentLines);
      mo.disconnect()
    });

    function process(mutations) {
      for (let i = 0; i < mutations.length; i++) {
        let nodes = mutations[i].addedNodes;
        for (let j = 0; j < nodes.length; j++) {
          let n = nodes[j];
          if (n.nodeType != 1) // only process Node.ELEMENT_NODE
            continue;
          const nodeList = n.matches(COMMENT_CLASS_SELECTOR)
            ? [n]
            : n.querySelectorAll(COMMENT_CLASS_SELECTOR);
          doDelete(nodeList);
        }
      }
    }
    function doDelete(nodes) {
      [].forEach.call(nodes, (node) => {
        const commentLine = getLineNumberFromSpan(node);
        if (commentLine !== -1) {
          commentLines.push(commentLine);
        }
        node.remove();
      });
    }

  })
}

// Chrome pre-34
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.webkitMatchesSelector;
}

function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function removeAllButBranding(anchor) {
  while (anchor.children.length > 1) {
    anchor.removeChild(anchor.children[1]);
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
  removeChildren,
  removeAllButBranding
}





