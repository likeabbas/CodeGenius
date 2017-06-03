/**
 * @author Anthony Altieri on 6/3/17.
 */

import firebase from './fb';
import R from 'ramda';

export function getByName(name) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`owners/${name}`)
      .once('value')
      .then(snapshot => res(snapshot))
  })
}

export function add(name) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`owners/${name}`)
      .set({ name })
      .then(() => res())
      .catch(error => rej(error))
  })

}
