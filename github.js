
const COMMENT_CLASS_SELECTOR = 'pl-c';
const CODE_LINE_SELECTOR     = 'data-line-number';
const HIDE_COMMENT = 'hideComment'
const TD    = 'td'
const TR    = 'tr'
const TBODY = 'tbody'

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
 * comments {
 *   (line number) -> commentObject 
 * }
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
    lineNumbers.push(tdLineNumber.getAttribute(CODE_LINE_SELECTOR))
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
  comment.totalComment   = commentString.join()
  comment.leadTrOriginalString = leadTrOriginalString
  
  return [comment, lastLine]
}


function getComments(tbody) {

  let comments = {}
  trs = tbody.getElementsByTagName(TR)

  let commentIndexes = []

  for (let i = 0; i < trs.length; i++) {

    curTr = trs[i]
    curTdComment = curTr.children[1]

    if (IsComment(curTdComment) === true) {

      arr = createComment(trs, i)

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


document.addEventListener("DOMContentLoaded", function () {
  tbody = document.getElementsByTagName('tbody')[0]
  document.getElementsByTagName('head')[0].appendChild(hideCommentEl);

  const arr = getComments(tbody)
  let comments = arr[0]
  let commentIndexes  = arr[1]


  removeComments(comments, commentIndexes, tbody)
  console.log(comments)
  // addCommentBack(comments[6])
})
