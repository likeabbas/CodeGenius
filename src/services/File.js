/**
 * @author Anthony Altieri on 6/3/17.
 */

export function getKeyFromUrl(url) {
  const owner = getOwnerFromUrl(url);
  const name = getNameFromUrl(url);
  const fileName = getFileNameFromUrl(url);
  let combined = `${owner}|${name}|${fileName}`;
  return combined.replace('.', 'DOT')
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
