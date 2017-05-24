/**
 * Created by abbas and anthony altieri on 5/15/17.
 */
import getUtil from './util';
import * as api from './fakeapi';
(() => {
  const $ = getUtil(document);

  const COMMENT_CLASS_SELECTOR = '.pl-c';
  const CODE_LINE_SELECTOR = '.blob-code.blob-code-inner';
  const CONTAINER_SELECTOR = '.container.new-discussion-timeline.experiment-repo-nav';
  const YELLOW_COLOR = 'rgb(248,238, 199)';
  const GREY_COLOR = 'rgba(0,0,0,0.05)';
  const ELEMENT_NODE = 1;
  const TOP_NODE_ID = 'js-repo-pjax-container';

  init();


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
        console.log('hihihh')
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
  function matchCodeLinesToComments(commentLines, codeLines) {
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

  function injectWriteBox(anchor, picUrl) {
    const writeBoxWrapper = $.div();
    $.addClasses(writeBoxWrapper, ['flybyWriteboxWrapper']);
    const container = $.div();
    $.addClasses(container, ['flybyWriteBox']);
    const heading = $.div();
    $.addClasses(heading, ['flybyCommentHeader']);
    const pic = $.create('im');
    pic.src = picUrl;
    $.addClasses(pic, ['flybyCommentPic']);
    const writeContentDiv = $.div();
    $.addClasses(
      writeContentDiv,
      [
        'write-content',
        'js-write-bucket' ,
        'js-uploadable-container',
        'js-upload-markdown-image',
        'is-default upload-enabled'
      ]
    );
    const writeBody = $.create('textarea');
    $.addClasses(writeBody, ['previewable-comment-form']);
    $.appendChildren(writeContentDiv, [writeBody]);
    $.appendChildren(writeBoxWrapper, [pic, container]);
    $.appendChildren(container, [writeContentDiv]);
    $.appendChildren(anchor, [container]);
  }

  function injectCodeComment(anchor, content) {
    const container = $.div();
    $.addClasses(container, ['flybyCodeComment']);
    const contentDiv = $.div();
    contentDiv.innerHTML = content;
    $.addClasses(content, ['flybyCodeCommentContent']);
    $.appendChildren(container, [contentDiv]);
    $.appendChildren(anchor, [container]);
  }


  function injectComment(anchor, username, content, picUrl) {
    const container = $.create('div');
    $.addClasses(container, ['flybyComment']);
    const heading = $.create('div');
    $.addClasses(heading, ['flybyCommentHeader']);
    const pic = $.create('img');
    pic.src = picUrl;
    $.addClasses(pic, ['flybyCommentPic']);
    const displayName = $.create('p');
    displayName.innerHTML = username;
    $.appendChildren(heading, [displayName]);
    const contentDiv = $.create('div');
    $.addClasses(contentDiv, ['flybyCommentContent']);
    contentDiv.innerHTML = content;
    $.appendChildren(container, [heading, contentDiv]);
    const commentWrapper = $.create('div');
    $.addClasses(commentWrapper, ['flybyCommentWrapper']);
    $.appendChildren(commentWrapper, [pic, container]);
    $.appendChildren(anchor, [commentWrapper]);
  }

  function injectBranding(anchor) {
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
        document.getElementById(`LC${lineNumber}`).onclick = () => {
          console.log(codeLinesToComments[lineNumber])
        }

      })
  }

  function injectLineHighlights(lineNumbers) {
    const styleLines = lineNumbers.map((lineNumber) => (
      `#LC${lineNumber}{ 
            background-color: ${GREY_COLOR};
            cursor: pointer;
       }
      `.replace(/(\n+|\t+|\s+)/, '')
    ));
    document.querySelector('head').innerHTML += '<style>' +
      styleLines.reduce((a, c) => a + `${c}`, '') + '</style>';
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


})();





