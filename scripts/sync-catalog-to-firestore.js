import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { seedProducts } from '../database/seed.js';

const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

async function syncAllToFirestore() {
  console.log('🔄 Checking all products against Firestore database:', cfg.firestoreDatabaseId);
  const snap = await getDocs(collection(db, 'products'));
  const existingIds = new Set(snap.docs.map(d => d.id));
  console.log(`Currently ${snap.size} products in Firestore.`);

  const batch = writeBatch(db);
  let count = 0;

  for (const prod of seedProducts) {
    const docId = String(prod.id);
    if (!existingIds.has(docId)) {
      const docRef = doc(db, 'products', docId);
      batch.set(docRef, {
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        image_url: prod.image_url,
        stock: prod.stock,
        category: prod.category,
        status: 'published',
        createdAt: new Date().toISOString()
      }, { merge: true });
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Successfully added ${count} catalog products into Firestore!`);
  } else {
    console.log('All catalog products already exist in Firestore.');
  }
}

syncAllToFirestore()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
