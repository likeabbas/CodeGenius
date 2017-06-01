/**
 * @author Anthony Altieri on 5/24/17.
 */

const loremIpsumShort = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const loremIpsumMedium = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
const loremIpsumLong = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const picUrl = 'https://avatars1.githubusercontent.com/u/8461581?v=3&s=88';

function getDateTime() { return new Date().getTime() / 1000 }


const comments = [
  {
    username: 'AnthonyAltieri',
    content: loremIpsumShort,
    picUrl,
  },
  {
    username: 'John Doe',
    content: loremIpsumMedium,
    picUrl,
  },
  {
    username: 'AnthonyAltieri',
    content: loremIpsumLong,
    picUrl,
  },
  {
    username: 'Jane Doe',
    content: loremIpsumShort,
    picUrl,
  },
];

const db = {
  repositories: [
    {
      name: 'Jest',
      owner: 'Facebook',
      files: [
        {
          name: 'dangerfile.js',
          lines: [
            {
              number: 19,
              type: 'CODE',
              content: 'Takes a list of file paths, and converts it into clickable links',
              comments: [
                {
                  username: 'AnthonyAltieri',
                  content: loremIpsumMedium,
                  picUrl: picUrl,
                  date: getDateTime(),
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export function postComment(content, sorceCodeUrl, lineNumber) {
}

function getUrlSlashSplit(url) {
  let pre = 'https';
  if (url.split(':')[0] === 'http') {
    pre = 'http';
  }
  return url.replace(`${pre}://github.com/`, '').split('/');
}

function getOwnerFromUrl(url) {
  return getUrlSlashSplit(url)[0];
}
function getNameFromUrl(url) {
  return getUrlSlashSplit(url)[1]
}
function getFileNameFromUrl(url) {
  return getUrlSlashSplit(url).reduce((a, c, i) => {
    if (i >= 4) {
      return a + c;
    }
    return a;
  }, '')
}

export function addCodeComment(content, sourceCodeUrl, lineNumber) {
  const owner = getOwnerFromUrl(sourceCodeUrl);
  const name = getNameFromUrl(sourceCodeUrl);

  let repo = db.repositories
    .filter(r => r.owner.toLowerCase() === owner.toLowerCase())[0];

  if (!repo) {
    let files = []
    repo = { owner, name, files};
    db.repositories.push(repo)
  }

  const fileName = getFileNameFromUrl(sourceCodeUrl);

  let file = repo.files
    .filter(f => f.name.toLowerCase() === fileName.toLowerCase())[0];

  if (!file) {
    file = { name: fileName, lines: [] };
    repo.files.push(file);
  }

  let line = file.lines.filter(l => l.number === lineNumber)[0];

  if (!line) {
    line = { number: lineNumber, comments: [], content: '' };
  }

  line = { ...line, type: 'CODE', content };
  file.lines = [...file.lines.filter(l => l.number !== lineNumber), line];
  file.lines.sort((a, b) => a.number - b.number);
}

export function addComment(content, username, picUrl, sourceCodeUrl, lineNumber) {

  const owner = getOwnerFromUrl(sourceCodeUrl);
  const name = getNameFromUrl(sourceCodeUrl);

  let repo = db.repositories
    .filter(r => r.owner.toLowerCase() === owner.toLowerCase())[0];

  // Create repo if it doesn't exists
  if (!repo) {
    let files = []
    repo = { owner, name, files };
    db.repositories.push(repo)
  }

  const fileName = getFileNameFromUrl(sourceCodeUrl);

  let file = repo.files
    .filter(f => f.name.toLowerCase() === fileName.toLowerCase())[0];

  if (!file) {
    file = { name: fileName, lines: [] };
    repo.files.push(file);
  }

  let line = file.lines.filter(l => l.number === lineNumber)[0];

  if (!line) {
    line = { number: lineNumber, comments: [], content: '' };
  }

  if (line.content === '') {
    line.type = 'COMMENT';
  }

  const comment = {
    date: getDateTime(),
    username,
    content,
    picUrl,
  };

  line.comments.push(comment);
  file.lines = [...file.lines.filter(l => l.number !== lineNumber), line];
  file.lines.sort((a, b) => a.number - b.number);
}


export function getComments(sourceCodeUrl) {
  return comments;
}

export default {
  getComments,
}
