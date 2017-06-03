/**
 * @author Anthony Altieri on 6/3/17.
 */

import firebase from './fb';
import R from 'ramda';

export function add(owner, repository, branch, filePath) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`files/${owner}|${repository}|${branch}|${filePath}`)
      .set({
        comments: [],
      })
  })
}
