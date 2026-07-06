const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Simple parser for .env.local
try {
  const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      value = value.replace(/^['"]|['"]$/g, '').trim(); // remove quotes
      process.env[match[1]] = value;
    }
  });
} catch (e) {
  console.log("Could not read .env.local");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Config loaded:", { ...firebaseConfig, apiKey: "HIDDEN" });

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  console.log("Attempting to write to Firestore...");
  // Timeout after 10 seconds
  setTimeout(() => {
    console.error("TIMEOUT: Firebase write hung for 10 seconds! Check your network/ISP.");
    process.exit(1);
  }, 10000);

  try {
    const testDoc = doc(db, 'test', 'ping');
    await setDoc(testDoc, { timestamp: Date.now() });
    console.log("SUCCESS! Connected and wrote to Firestore.");
    process.exit(0);
  } catch (err) {
    console.error("ERROR! Failed to write to Firestore:", err);
    process.exit(1);
  }
}

testConnection();
