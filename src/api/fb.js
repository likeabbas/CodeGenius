/**
 * @author Anthony Altieri on 6/3/17.
 */
import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyD1wN7SdQide3NT5MHc5WKaMECppjyEPgQ",
  authDomain: "flyby-6b6bd.firebaseapp.com",
  databaseURL: "https://flyby-6b6bd.firebaseio.com",
  projectId: "flyby-6b6bd",
  storageBucket: "flyby-6b6bd.appspot.com",
  messagingSenderId: "215210881935",
};
firebase.initializeApp(config);

export default firebase;



