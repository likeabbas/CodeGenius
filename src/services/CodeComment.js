/**
 * @author Anthony Altieri on 6/3/17.
 *
 * Comments are stored on Github in the following fashion
 * <tr>
 *  <td
 *    id={`LC${lineNumber}`}
 *    class="blob-num js-line-number"
 *    data-line-number={`${lineNumber}`}
 *  >
 *    {lineNumber}
 *  </td>
 *  <td
 *    id={`LC${lineNumber}`}
 *    class="blob-code blob-code-inner js-file-line"
 *   >
 *    ...bunch of spans with code content...
 * </tr>
 *
 *
 *
 */
import R from 'ramda';
import * as CodeService from './Code';



/**
 * Pass in a <td> node that could potentially be a comment, returns true if that
 * node is a comment and false if it isn't
 *
 * @return {boolean}
 */
function IsComment(codeLineNode) {
  const span = td.children[0];
  return (typeof span === 'undefined') ? false : span.classList.contains(COMMENT_CLASS);
}

// Take away the code tokens so just the words of the comment remain
export function prune(content) {
  if (content.length === 0) {
    throw new Error('content passed into prune() should\'nt ever be length 0');
  }

  // Remove any newlines
  content = content.replace('\n', '');

  if (content.trim().length === 1) {
    if (content === '*') return '';
  }
  if (content.trim().length === 2) {
    if (content === '//') return '';
    if (content === '/*') return '';
    if (content === '*/') return '';
  }
  if (content.trim().length === 3) {
    if (content === '/**') return '';
  }
  const firstChar = content[0];
  const secondChar = content[1];
  if (firstChar === '*' && secondChar !== ' ') {
    return content.substring(1).trim();
  }
  if (firstChar === '*' && secondChar === ' ') {
    return content.substring(2).trim();
  }
  if (`${firstChar}${secondChar}` === '//') {
    return content.substring(2).trim();
  }
  return content;
}

class CodeComment {
  constructor(content, lineNumber, node) {
    this.content = prune(content);
    this.lineNumber = +lineNumber;
    this.node = node;
  }

  getNode() {
    return this.node;
  }
  getContent() {
    return this.content;
  }
  getLineNumber() {
    return this.lineNumber;
  }
}

class CodeCommentGroup {
  constructor(codeCommentList) {
    if (codeCommentList.length === 0) {
      throw new Error('A CodeCommentGroup needs at least one CodeComment');
    }
    this.group = codeCommentList;

    // Get the largest line number in the group
    this.largestLineNumber = codeCommentList[0].getLineNumber();
    for (let i = 1 ; i < codeCommentList.length ; i++) {
      const codeComment = codeCommentList[i];
      if (this.largestLineNumber < codeComment.getLineNumber()) {
        this.largestLineNumber = codeComment.getLineNumber();
      }
    }

    this.content = R.reduce((a, c) => a + c.getContent(), '', this.group);
  }


  getLargestLineNumber() {
    return this.largestLineNumber;
  }
  getGroup() {
    return this.group;
  }
  getContent() {
    return this.content;
  }
  deleteNodes() {
    for (let i = 0 ; i < this.group.length ; i++) {
      const codeComment = this.group[i];
      codeComment.getNode().parentNode.removeChild(codeComment.getNode());
    }
  }
}

export function groupCodeComments(codeCommentList) {
  let groups = [];
  let currentGroup = [];
  for (let i = 0 ; i < codeCommentList.length ; i++) {
    const codeComment = codeCommentList[i];

    if (currentGroup.length === 0) {
      currentGroup = [...currentGroup, codeComment];
      continue;
    }

    const lastAdded = currentGroup[currentGroup.length - 1];
    if (lastAdded.getLineNumber() + 1 === codeComment.getLineNumber()) {
      currentGroup = [...currentGroup, codeComment];
    } else {
      groups = [...groups, new CodeCommentGroup(currentGroup)];
      currentGroup = [codeComment];
    }
  }
  if (currentGroup.length !== 0) {
    groups = [...groups, new CodeCommentGroup(currentGroup)];
  }
  return groups;
}


export function getAll() {
  let codeCommentList = [];
  const commentLineNumbers = {};

  // Get the <tr>s that hold a line of code
  const codeLineNodes = CodeService.getCodeLineNodes();

  // Iterate through the nodes and create CodeComment objects if a code comment
  // is found
  for (let i = 0 ; i < codeLineNodes.length ; i++) {
    const codeLineNode = codeLineNodes[i];

    // Skip code line nodes with no content
    if (CodeService.isCodeLineNodeBlank(codeLineNode)) {
      continue;
    }

    // Add a CodeComment object to the codeComments list if needed
    if (CodeService.isCodeComment(codeLineNode)) {
      const content = CodeService.getCodeCommentContent(codeLineNode);
      const lineNumber = CodeService.getLineNumber(codeLineNode);
      commentLineNumbers[lineNumber] = true;
      codeCommentList = [
        ...codeCommentList,
        new CodeComment(content, lineNumber, codeLineNode)
      ];
    }
  }

  let headerCodeCommentLines =  [];
  let headerMap = {};
  for (let i = 0 ; i < codeCommentList.length ; i++) {
    const codeComment = codeCommentList[i];
    if (headerCodeCommentLines.length === 0) {
      if (codeComment.getLineNumber() === 1) {
        headerCodeCommentLines = [...headerCodeCommentLines, codeComment];
        headerMap[codeComment.lineNumber] = true;
        continue;
      } else {
        break;
      }
    }
    const lastAdded = headerCodeCommentLines[headerCodeCommentLines.length - 1];
    if (lastAdded.lineNumber + 1 === codeComment.lineNumber) {
      headerCodeCommentLines = [...headerCodeCommentLines, codeComment];
      headerMap[codeComment.lineNumber] = true;
    } else {
      break;
    }
  }

  console.log('headerMap', headerMap);

  // Remove the header comments from the code comment list
  const codeCommentsNoHeader = R.reduce(
    (a, c) => typeof headerMap[c.lineNumber] === 'undefined' ? [...a, c] : c,
    [],
    codeCommentList
  );


  return {
    codeComments: codeCommentsNoHeader,
    header: headerCodeCommentLines,
    commentLineNumbers: R.map(i => +i, Object.keys(commentLineNumbers)),
  };
}
