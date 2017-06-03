/**
 * @author Anthony Altieri on 6/3/17.
 */

import firebase from './fb';
import R from 'ramda';

export function getById(id) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`files/${id}`)
      .once('value')
      .then(snapshot => res(snapshot))
  })
}
