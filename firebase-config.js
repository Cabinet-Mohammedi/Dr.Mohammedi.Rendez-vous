// firebase-config.js (type=module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIrVOglgZALaaK6IwPwqHMiynBGD4Z3JM",
  authDomain: "mohammedi-cabinet.firebaseapp.com",
  databaseURL: "https://mohammedi-cabinet-default-rtdb.firebaseio.com",
  projectId: "mohammedi-cabinet",
  storageBucket: "mohammedi-cabinet.appspot.com",
  messagingSenderId: "666383356275",
  appId: "1:666383356275:web:09de11f9dfa2451d843506"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
