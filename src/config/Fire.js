import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

var firebaseConfig = {
  apiKey: "AIzaSyBjlzmxfNyInpjo257xMFUmYwr6aCTej14",
  authDomain: "crackin-beta.firebaseapp.com",
  databaseURL: "https://crackin-beta-default-rtdb.firebaseio.com",
  projectId: "crackin-beta",
  storageBucket: "crackin-beta.appspot.com",
  messagingSenderId: "663707823384",
  appId: "1:663707823384:web:5ba2a489f9590f610b426d",
  measurementId: "G-KLG77QDEDH"
};
  const fire = firebase.initializeApp(firebaseConfig);

  export default fire;