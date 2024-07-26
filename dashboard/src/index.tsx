import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';


import App from "./App";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgXJDoFXyRwYsbrGNByLo_lbPjDCZvvX4",
  authDomain: "scl-dashboard-6bd5f.firebaseapp.com",
  projectId: "scl-dashboard-6bd5f",
  storageBucket: "scl-dashboard-6bd5f.appspot.com",
  messagingSenderId: "1063294458107",
  appId: "1:1063294458107:web:64b0770ebb6bcf272cf85e",
  measurementId: "G-JBX72BYRFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);




root.render(
        <React.StrictMode>
            
                <App />
            
    </React.StrictMode>
);
