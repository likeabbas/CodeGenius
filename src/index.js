import injector from './injector'
import * as api from './fakeapi';


const COMMENT_CLASS_SELECTOR = 'pl-c';
const CODE_LINE_CLASS     = 'data-line-number';
const CODE_LINE_SELECTOR = '.blob-code.blob-code-inner';
const HIDE_COMMENT = 'hideComment'
const TD    = 'td'
const TR    = 'tr'
const TBODY = 'tbody'

const DEFAULT_PIC = 'https://avatars1.githubusercontent.com/u/8461581?v=3&s=88'

var hideCommentEl = document.createElement('style')
hideCommentEl.type = 'text/css'
hideCommentEl.innerHTML = ".hideComment { display: none }"

// let tbody     
const myTestDiv = document.createElement('div')
myTestDiv.textContent   = "ayo"
myTestDiv.style.display = "inline"

let state = {}

/* 
 * tr -> [td(line number), td (comment string)]  
 * 
 * ----- Each array in the comment obj correspond with each other (i.e. are the same length) --------
 * comment  {
 * 
 *   trs           -> [tr]     // all trs corresponding to comments in this obj 
 *   lineNumbers   -> [number] // array of line numbers
 *   commentString -> [string] // strings on line (matches with lineNumbers)
 * 
 *   leadTrOriginalString -> string // for replacing tr string back to normal  
 *   totalComment         -> string // combined comment string from multiple lines 
 * 
 * } 
 * 
 * comments
 *   [line number] -> commentObject
 *
 * 
 */

function IsComment(td) {

  if (!td.hasChildNodes()) {
    return false 
  }

  let span = td.children[0]

  if (span === undefined) {
    return false
  }

  let t = span.classList.contains(COMMENT_CLASS_SELECTOR)
  return t
}

// Returns array of [obj comment, int lastLine]
function createComment (listOfTrs, index) {

  let trs            = []
  let lineNumbers    = []
  let commentString = []

  let leadTrOriginalString 
  let i
  let lastLine

  for (lastLine = index; lastLine < listOfTrs.length; lastLine++) {
    
    const  tr  = listOfTrs[lastLine]
    const  tds = tr.getElementsByTagName(TD)

    const  tdLineNumber = tds[0]
    const  tdComment    = tds[1]

    if (!IsComment(tdComment)) {
      break
    }

    const  spanComment  = tdComment.children[0]

    trs.push(tr)
    lineNumbers.push(tdLineNumber.getAttribute(CODE_LINE_CLASS))
    commentString.push(spanComment.textContent)

    if (lastLine === index) {
      leadTrOriginalString = spanComment.textContent
    }
  }

  let comment = {}
  let ret = {}


  comment.trs            = trs 
  comment.lineNumbers    = lineNumbers
  comment.commentString  = commentString
  comment.totalComment   = commentString.reduce((a, c) => a + c, '')
  comment.leadTrOriginalString = leadTrOriginalString
  
  return [comment, lastLine]
}


function getComments(tbody) {

  let comments = {}
  const trs = tbody.getElementsByTagName(TR)

  let commentIndexes = []

  for (let i = 0; i < trs.length; i++) {

    const curTr = trs[i]
    const curTdComment = curTr.children[1]

    if (IsComment(curTdComment) === true) {

      const arr = createComment(trs, i)

      let comment       = arr[0]
      let lastLineIndex = arr[1]

      comments[i] = comment 
      commentIndexes.push(i)

      // move to next comment 
      i = lastLineIndex
    }
  }

  return [comments, commentIndexes]
}

function removeComment(comment) {
  
  for (let i = 1; i < comment.trs.length; i++) {

    let tr = comment.trs[i]
    tr.className += HIDE_COMMENT
    
  }

  comment.trs[0].children[1].children[0].textContent = ""
}

function removeComments (comments, commentIndexes) {

  for (let i = 0; i < commentIndexes.length; i++) {

    let index   = commentIndexes[i]
    let comment = comments[index]

    removeComment(comment)
  }
}

function addCommentBack (comment) {
  
  for (let i = 1; i < comment.trs.length; i++) {

    let tr = comment.trs[i]
    tr.classList.remove(HIDE_COMMENT)

  }

  comment.trs[0].children[1].children[0].textContent = comment.leadTrOriginalString
}

function CodeLineTuple(lineNumber, comment) {
  this.lineNumber = lineNumber;
  this.comment = comment;
}

function getLinesWithCode() {
  const codeLines = document.querySelectorAll(CODE_LINE_SELECTOR)
  let lineNumbers = [];
  for (let i = 0 ; i < codeLines.length ; i++) {
    lineNumbers.push(+codeLines[i].getAttribute('id').substring(2));
  }
  return lineNumbers;
}



document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.getElementsByTagName('tbody')[0]
  document.getElementsByTagName('head')[0].appendChild(hideCommentEl);

  const arr = getComments(tbody)
  let comments = arr[0]
  let commentIndexes  = arr[1]


  removeComments(comments, commentIndexes, tbody)
  const commentLines = Object.keys(comments)
    .map(key => comments[key])
    .reduce((a, c) => [...a, ...c.lineNumbers ], [])
    .map(n => +n)
  const codeLinesToComments = injector.matchCodeLinesToComments(commentLines, getLinesWithCode())
  const codeLines = Object.keys(codeLinesToComments).map(i => +i);
  let codeLineNodes = []
  for (let i = 0 ; i < codeLines.length ; i++) {
    codeLineNodes.push(document.querySelectorAll(`#LC${codeLines[i]}`)[0])
  }
  const lineNumberToComment = Object.keys(comments).reduce((a, key) => {
    const comment = comments[key];
    for (let i = 0 ; i < comment.lineNumbers.length ; i++) {
      a[comment.lineNumbers[i]] = comment.commentString[i];
    }
    return a;
  }, {});
  const anchor = injector.configureContainer();
  injector.injectBranding(anchor);
  injector.injectLineHighlights(codeLines, codeLineNodes);
  codeLineNodes.forEach((node) => {
    node.onclick = () => {
      const lineNumber = +node.getAttribute('id').substring(2);
      const comment = codeLinesToComments[lineNumber]
        .reduce((a, c) => a + lineNumberToComment[+c], '')
        .replace(/(\/{2})/, '');
      injector.removeAllButBranding(anchor);
      injector.injectCodeComment(anchor, comment);
      const comments = api.getComments(window.location.toString());
      comments.forEach(c => injector.injectComment(anchor, c.username, c.content, c.picUrl));
    }
  })
  console.log('hihihi')
  injector.injectWriteBox(anchor, DEFAULT_PIC);

  const commentButton = document.querySelector('#flybyWriteBoxCommentButton');
  const writeBoxContent = document.querySelector('#flybyWriteBoxContent');
  commentButton.onclick = () => {
    const content = writeBoxContent.value;
    if (content.trim() === '') return;

  }


  // addCommentBack(comments[6])
})
