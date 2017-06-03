import * as DOMService from './injector'
import R from 'ramda';
import * as api from './fakeapi';
import * as CodeCommentService from './services/CodeComment';
import * as CodeService from './services/Code';

const COMMENT_CLASS_SELECTOR = 'pl-c';
const CODE_LINE_CLASS     = 'data-line-number';
const CODE_LINE_SELECTOR = '.blob-code.blob-code-inner';
const HIDE_COMMENT = 'hideComment'
const TD    = 'td'
const TR    = 'tr'
const TBODY = 'tbody'
const USER_ID = 123;


const DEFAULT_PIC = 'https://avatars3.githubusercontent.com/u/8461581?v=3&s=40';

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

  let span = td.children[0]

  if (span === undefined) {
    return false
  }

  let t = span.classList.contains(COMMENT_CLASS_SELECTOR)
  return t
}

// checking if the line is blank
function IsBlank(td) {

  if (!td.hasChildNodes()) {
    return true
  }
}

// Returns array of [obj comment, int lastLine]
function createComment (listOfTrs, index) {

  let trs            = []
  let lineNumbers    = []
  let commentString  = []

  let leadTrOriginalString 
  let i
  let lastLine

  for (lastLine = index; lastLine < listOfTrs.length; lastLine++) {
    
    const  tr  = listOfTrs[lastLine]
    const  tds = tr.getElementsByTagName(TD)

    const  tdLineNumber = tds[0]
    const  tdComment    = tds[1]

    if (!IsBlank(tdComment) && !IsComment(tdComment)) {
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
  
  for (let i = 0; i < comment.trs.length; i++) {

    let tr = comment.trs[i]
    tr.className += HIDE_COMMENT
    
  }

  //comment.trs[0].children[1].children[0].textContent = ""
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

function renderComments(url, lineNumber) {
  let anchor = document.getElementById('flybyComments');
  const comments = api.getComments(url, lineNumber);
  if (!comments) {
    console.log(`no comments for line ${lineNumber}`);
  } else {
    comments.forEach(c => DOMService.injectComment(c.username, c.content, c.picUrl));
  }
}

function removeComments() {
  let flybyComments = document.getElementById('flybyComments');
  R.forEach(
    (a) => {
      if (!!flybyComments && !!a) {
        flybyComments.removeChild(a)
      }
    },
    flybyComments.children
  );
}


function toNumber(element) {
  return +element;
}

document.addEventListener("DOMContentLoaded", function () {
  const URL = window.location.href;

  // Get all of the CodeComment objects
  const {
    codeComments,
    header,
    commentLineNumbers,
  } = CodeCommentService.getAll();
  console.log('codeComments', codeComments);

  // Get a list of all Code objects
  const codeList = CodeService.getAll(commentLineNumbers);

  // Make a map of line numbers to code objects
  const codeMap = R.reduce(
    (a, c) => {
      a[c.getLineNumber()] = c;
      return a;
    },
    {},
    codeList
  );

  // Get a list of all CodeCommentGroup objects
  const codeCommentGroups = CodeCommentService.groupCodeComments(codeComments);

  // Assign CodeCommentGroup objects to their corresponding Code objects
  CodeService.assignCodeCommentGroupsToCode(codeCommentGroups, codeList);

  // Create a DOM node to anchor our injections
  const anchor = DOMService.configureContainer();

  // Put in our branding
  DOMService.initDOM(anchor);

  // Inject the class for the line highights
  DOMService.injectLineHighlights();

  let currentLine = -1;

  for (let i = 0 ; i < codeList.length ; i++) {
    const code = codeList[i];
    if (code.hasCodeCommentGroup()) {
      const lineNumber = code.getLineNumber();
      const commentGroup = code.getCommentGroup();
      api.addCodeComment(commentGroup.getContent(), URL, lineNumber);

      code.getNode().classList.add(DOMService.CLASS_FLYBY_HIGHLIGHT);
      code.getNode().onclick = () => {
        if (lineNumber === currentLine) return;
        DOMService.clearCodeComment();
        DOMService.injectCodeComment(code.getCommentGroup().getContent());

        const line = api.getLine(URL, lineNumber);
        renderComments(URL, lineNumber);

        if (currentLine === -1) {
          DOMService.injectWriteBox(anchor, DEFAULT_PIC);
        }

        code.getNode().classList.add('flybySelected');

        if (currentLine !== -1) {
          const oldCode = codeMap[currentLine];
          oldCode.getNode().classList.remove('flybySelected');
        }

        currentLine = lineNumber;



        const commentButton = document.querySelector('#flybyWriteBoxCommentButton');
        const writeBoxContent = document.querySelector('#flybyWriteBoxContent');
        commentButton.onclick = () => {
          const content = writeBoxContent.value;
          if (content.trim() === '') return;
          const success = api.postComment(content, USER_ID, URL, lineNumber);
          if (success) {
            console.log('comment successfully posted');
            removeComments();
            renderComments(URL, lineNumber);
            writeBoxContent.value = '';
            console.log('db', api.getDb());
          } else {
            console.log('comment unsuccessfully posted');
          }

        }

      }
    }
  }

  console.log(api.getDb());

  // addCommentBack(comments[6])
})
