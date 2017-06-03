/**
 * @author Anthony Altieri on 6/3/17.
 */
import * as firebase from 'firebase';
import v1 from 'uuid/v1';

export function add(userId, content) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`comments/${v1()}`)
      .set({ userId, content })
      .then(() => res())
      .catch(error => rej(error))
  });
}

export function get(id) {
  return new Promise((res, rej) => {
    
  })
}

