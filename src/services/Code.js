/**
 * @author Anthony Altieri on 6/3/17.
 */
import R from 'ramda';
const COMMENT_CLASS = 'pl-c';


function getTbody() {
  return document.getElementsByTagName('tbody')[0];
}
function getTrs(tbody) {
  return tbody.getElementsByTagName('tr');
}
export function getCodeLineNodes() {
  return getTrs(getTbody());
}
export function getLineNumber(codeLineNode) {
  // Make sure the correct node is passed in
  validateCodeLineNode(codeLineNode);
  const tds = codeLineNode.getElementsByTagName('td');

  // The first <td> contains the line number for this line
  const tdLineNumber = tds[0];

  const lineNumber = tdLineNumber.getAttribute('data-line-number');

  if (lineNumber === null) {
    throw new Error('data-line-number attribute should not be null');
  }

  return +lineNumber;
}

export function validateCodeLineNode(codeLineNode) {
  // Get the <td>s that contain content for this line of code
  const tds = codeLineNode.getElementsByTagName('td');

  if (tds.length !== 2) {
    throw new Error('There should be two child <td>s');
  }

  if (!tds[0]) {
    throw new Error('The <td> for line number should\'nt be falsey');
  }
  if (!tds[1]) {
    throw new Error('The <td> for code inner should\'nt be falsey');
  }
}

function getCodeInnerTd(codeLineNode) {
  const tds = codeLineNode.getElementsByTagName('td');

  // The second td will contain the code inner
  return tds[1];
}

export function isCodeComment(codeLineNode) {
  // Make sure the correct node is passed in
  validateCodeLineNode(codeLineNode);

  const tdCodeInner = getCodeInnerTd(codeLineNode);

  // The span that contains the comment will be the first child
  const firstSpan = tdCodeInner.children[0];

  // If there is no spans inside the line must have no code content
  if (!firstSpan) {
    return false;
  }

  return firstSpan.classList.contains(COMMENT_CLASS);
}

export function getCodeCommentContent(codeLineNode) {
  // Make sure the correct node is passed in
  validateCodeLineNode(codeLineNode);

  const tdCodeInner = getCodeInnerTd(codeLineNode);

  // The span that contains the comment will be the first child
  const spanComment = tdCodeInner.children[0];

  if (!spanComment) {
    throw new Error('The span that contains the comments shouldn\'t be falsey');
  }

  return spanComment.textContent;
}

class Code {
  constructor(content, lineNumber, node) {
    this.content = content;
    this.lineNumber = +lineNumber;
    this.codeCommentGroup = null;
    this.comments = [];
    this.node = node;
  }

  hasCodeCommentGroup() {
    return this.codeCommentGroup !== null;
  }

  getNode() {
    return this.node;
  }
  getLineNumber() {
    return this.lineNumber;
  }
  getContent() {
    return this.content;
  }
  getCommentGroup() {
    return this.codeCommentGroup;
  }

  setCodeCommentGroup(codeCommentGroup) {
    this.codeCommentGroup = codeCommentGroup;
  }
}

export function assignCodeCommentGroupsToCode(codeCommentGroups, codeList) {
  // Map line numbers to Code objects
  const lineNumberToCode = {};
  R.forEach(c => lineNumberToCode[c.getLineNumber()] = c, codeList);

  for (let i = 0 ; i < codeCommentGroups.length ; i++) {
    const codeCommentGroup = codeCommentGroups[i];
    const oneLineDown = codeCommentGroup.getLargestLineNumber() + 1;
    if (typeof lineNumberToCode[oneLineDown] !== 'undefined') {
      const code = lineNumberToCode[oneLineDown];
      code.setCodeCommentGroup(codeCommentGroup);
      codeCommentGroup.deleteNodes();
    }
  }
}



export function isCodeLineNodeBlank(codeLineNode) {
  return !codeLineNode.hasChildNodes();
}

function getCodeContent(codeLineNode) {
  validateCodeLineNode(codeLineNode);
  const children = getCodeInnerTd(codeLineNode).children;
  return R.reduce((a, span) => a + span.textContent + ' ', '', children).trim();
}

export function getAll(commentLineNumbers) {
  const commentLineMap = {};
  R.forEach(cl => commentLineMap[cl] = true, commentLineNumbers);
  console.log('commentLineMap', commentLineMap);
  let codeList = [];
  const codeLineNodes = getCodeLineNodes();

  for (let i = 0 ; i < codeLineNodes.length ; i++) {
    const codeLineNode = codeLineNodes[i];

    if (isCodeLineNodeBlank(codeLineNode)) {
      continue;
    }

    const lineNumber = getLineNumber(codeLineNode);

    // If there is content on this line and its not a comment it has to be
    // actual code content
    if (typeof commentLineMap[lineNumber] === 'undefined') {
      const content = getCodeContent(codeLineNode);
      if (content.trim().length === 0) {
        continue;
      }
      codeList = [...codeList, new Code(content, lineNumber, codeLineNode)]
    }
  }

  return codeList;
}
