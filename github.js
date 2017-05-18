/**
 * Created by abbas and anthony altieri on 5/15/17.
 */
const COMMENT_CLASS_SELECTOR = '.pl-c';
const CODE_LINE_SELECTOR = '.blob-code.blob-code-inner';
const YELLOW_COLOR = 'rgb(248,238, 199)';
const ELEMENT_NODE = 1;

init();

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


function init() {
  Promise.all([deleteElements(), getLinesWithCode()])
    .then(([commentLines, codeLines]) => {
      const codeLinesToComments = matchCodeLinesToComments(commentLines, codeLines);
      injectLineHighlights(Object.keys(codeLinesToComments));
    });
}

function injectLineHighlights(lineNumbers) {
  const styleLines = lineNumbers.map((lineNumber) => (
      `#LC${lineNumber}{ 
            background-color: ${YELLOW_COLOR};
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




