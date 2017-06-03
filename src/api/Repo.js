/**
 * @author Anthony Altieri on 6/3/17.
 */

import firebase from './fb';
import R from 'ramda';


export function getIdByOwner(owner) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`owners/`)
  })
}

export function getById(id) {
  return new Promise((res, rej) => {
    firebase.database()
      .ref(`repositories/${id}`)
      .once('value')
      .then(snapshot => res(snapshot))
  })
}


