import * as DOMService from './services/DOM'
import R from 'ramda';
import * as CommentApi from './api/Comment';
import * as CodeCommentService from './services/CodeComment';
import * as CodeService from './services/Code';

import * as state from './state';


const DEFAULT_PIC = 'https://avatars3.githubusercontent.com/u/8461581?v=3&s=40';
const USER_ID = 123;



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


async function renderComments(url, lineNumber) {
  let anchor = document.getElementById('flybyComments');
  try {
    const comments = await CommentApi.get(url, lineNumber);
    if (!comments) {
      console.log(`no comments for line ${lineNumber}`);
    } else {
      R.forEach(
        c => DOMService.injectComment(c.username, c.content, c.picUrl),
        comments
      )
    }
  } catch (e) {
    console.error('CommentApi.get Error', e);
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
  state.init();

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


  for (let i = 0 ; i < codeList.length ; i++) {
    const code = codeList[i];
    if (code.hasCodeCommentGroup()) {
      const lineNumber = code.getLineNumber();
      const commentGroup = code.getCommentGroup();

      code.getNode().classList.add(DOMService.CLASS_FLYBY_HIGHLIGHT);
      code.getNode().onclick = () => {
        if (lineNumber === state.getCurrentLine()) return;
        DOMService.clearCodeComment();
        DOMService.injectCodeComment(code.getCommentGroup().getContent());
        DOMService.clearComments();

        renderComments(URL, lineNumber);

        if (!state.isCurrentLineSet()) {
          DOMService.injectWriteBox(anchor, DEFAULT_PIC);
        } else {
          const oldCode = codeMap[state.getCurrentLine()];
          oldCode.getNode().classList.remove('flybySelected');
        }

        if (!DOMService.isSidebarShowing()) {
          const pagehead = document.querySelector(DOMService.PAGEHEAD_SELECTOR);
          const header = document.getElementsByClassName('header')[0];
          const main = document.querySelector('div[role=main]');
          const container = document.querySelector(DOMService.CONTAINER_SELECTOR);
          DOMService.showSidebar(main, container, header, pagehead);
        }

        code.getNode().classList.add('flybySelected');

        state.setCurrentLine(lineNumber);

        const commentButton = document.querySelector('#flybyWriteBoxCommentButton');
        const writeBoxContent = document.querySelector('#flybyWriteBoxContent');
        commentButton.onclick = async () => {
          const content = writeBoxContent.value;
          if (content.trim() === '') return;

          try {
            await CommentApi.add(USER_ID, content, lineNumber, DEFAULT_PIC, URL);
            console.log('comment successfully posted');
            removeComments();
            renderComments(URL, lineNumber);
            writeBoxContent.value = '';
          } catch (e) {
            console.error('CommentApi.add error', e);
          }
        }

      }
    }
  }
})
