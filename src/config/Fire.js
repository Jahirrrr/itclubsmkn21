import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

var firebaseConfig = {
  apiKey: "AIzaSyBpC_J5GzPrkKP54wLoSXWLAN9N66-Hkg0",
  authDomain: "itclub21.firebaseapp.com",
  databaseURL: "https://itclub21-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "itclub21",
  storageBucket: "itclub21.appspot.com",
  messagingSenderId: "622811807432",
  appId: "1:622811807432:web:c1e4ae3e31a4a44a95affd",
  measurementId: "G-PHQBH4KEVJ"
};
  const fire = firebase.initializeApp(firebaseConfig);

  export default fire;
