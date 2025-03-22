import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpmAUBrjL9EKVr9jPzMIppomH_BsWu1ME",

  authDomain: "gordinhoss.firebaseapp.com",

  projectId: "gordinhoss",

  storageBucket: "gordinhoss.firebasestorage.app",

  messagingSenderId: "107785818887",

  appId: "1:107785818887:web:a0e42e857d01e20b85eba2"

};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços do Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);