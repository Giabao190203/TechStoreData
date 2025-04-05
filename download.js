const admin = require("firebase-admin");
const fs = require("fs");

// Khởi tạo Firebase Admin
const serviceAccount = require('D:/Download/Games/techdata-8cd6c-firebase-adminsdk-fbsvc-275aece5c3.json'); // Tải file JSON từ Firebase Console
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Hàm lấy dữ liệu từ Firestore và lưu thành JSON
async function exportFirestoreData() {
    let data = {};
    const collections = await db.listCollections();

    for (let collection of collections) {
        let collectionData = [];
        const snapshot = await collection.get();
        snapshot.forEach(doc => {
            collectionData.push({ id: doc.id, ...doc.data() });
        });
        data[collection.id] = collectionData;
    }

    fs.writeFileSync("firestore-data.json", JSON.stringify(data, null, 2));
    console.log("🔥 Dữ liệu đã được tải xuống: firestore-data.json");
}

exportFirestoreData();
