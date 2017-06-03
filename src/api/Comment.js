/**
 * @author Anthony Altieri on 6/3/17.
 */
import firebase from './fb';
import R from 'ramda';
import v1 from 'uuid/v1';
import { getKeyFromUrl } from '../services/File';

export function add(userId, content, lineNumber, url) {
  const key = getKeyFromUrl(url);
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`comments/${key}/${v1()}`)
      .set({ userId, content, lineNumber, time: new Date() })
      .then(() => res())
      .catch(error => rej(error))
  });
}

export function get(url, lineNumber) {
  const key = getKeyFromUrl(url);
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`comments/${key}`)
      .once('value')
      .then(snapshot => res(R.filter(c => c.lineNumber === lineNumber, snapshot)))
      .catch(error => rej(error))
  })
}

