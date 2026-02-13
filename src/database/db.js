import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

const database_name = 'ChildTracker.db';
const database_version = '1.0';
const database_displayname = 'NFC Child Tracker Database';
const database_size = 200000;

let db;

/**
 * Veritabanı bağlantısını aç
 */
export const openDatabase = async () => {
    if (db) {
        return db;
    }

    try {
        db = await SQLite.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size
        );
        console.log('Database opened successfully');
        await createTables();
        return db;
    } catch (error) {
        console.error('Error opening database:', error);
        throw error;
    }
};

/**
 * Tabloları oluştur
 */
const createTables = async () => {
    try {
        // Çocuklar tablosu
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS children (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        card_number TEXT UNIQUE,
        card_type TEXT,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // İşlemler tablosu (harcamalar ve yolculuklar)
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL,
        amount REAL,
        location TEXT,
        description TEXT,
        card_number TEXT,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children (id)
      )
    `);

        // Yolculuklar tablosu
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS travels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER NOT NULL,
        from_location TEXT,
        to_location TEXT,
        vehicle_type TEXT,
        vehicle_number TEXT,
        travel_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children (id)
      )
    `);

        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
};

/**
 * Çocuk ekle
 */
export const addChild = async (name, cardNumber, cardType, photo = null) => {
    try {
        const database = await openDatabase();
        const result = await database.executeSql(
            'INSERT INTO children (name, card_number, card_type, photo) VALUES (?, ?, ?, ?)',
            [name, cardNumber, cardType, photo]
        );
        return result[0].insertId;
    } catch (error) {
        console.error('Error adding child:', error);
        throw error;
    }
};

/**
 * Tüm çocukları getir
 */
export const getAllChildren = async () => {
    try {
        const database = await openDatabase();
        const results = await database.executeSql('SELECT * FROM children ORDER BY name');
        const children = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            children.push(results[0].rows.item(i));
        }

        return children;
    } catch (error) {
        console.error('Error getting children:', error);
        throw error;
    }
};

/**
 * Çocuğu kart numarasına göre bul
 */
export const getChildByCardNumber = async (cardNumber) => {
    try {
        const database = await openDatabase();
        const results = await database.executeSql(
            'SELECT * FROM children WHERE card_number = ?',
            [cardNumber]
        );

        if (results[0].rows.length > 0) {
            return results[0].rows.item(0);
        }
        return null;
    } catch (error) {
        console.error('Error getting child by card number:', error);
        throw error;
    }
};

/**
 * İşlem ekle (harcama)
 */
export const addTransaction = async (childId, transactionType, amount, location, description, cardNumber) => {
    try {
        const database = await openDatabase();
        const result = await database.executeSql(
            `INSERT INTO transactions (child_id, transaction_type, amount, location, description, card_number, transaction_date) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [childId, transactionType, amount, location, description, cardNumber]
        );
        return result[0].insertId;
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
};

/**
 * Çocuğun tüm işlemlerini getir
 */
export const getTransactionsByChild = async (childId) => {
    try {
        const database = await openDatabase();
        const results = await database.executeSql(
            'SELECT * FROM transactions WHERE child_id = ? ORDER BY transaction_date DESC',
            [childId]
        );
        const transactions = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            transactions.push(results[0].rows.item(i));
        }

        return transactions;
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
    }
};

/**
 * Yolculuk ekle
 */
export const addTravel = async (childId, fromLocation, toLocation, vehicleType, vehicleNumber) => {
    try {
        const database = await openDatabase();
        const result = await database.executeSql(
            `INSERT INTO travels (child_id, from_location, to_location, vehicle_type, vehicle_number, travel_date) 
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [childId, fromLocation, toLocation, vehicleType, vehicleNumber]
        );
        return result[0].insertId;
    } catch (error) {
        console.error('Error adding travel:', error);
        throw error;
    }
};

/**
 * Çocuğun tüm yolculuklarını getir
 */
export const getTravelsByChild = async (childId) => {
    try {
        const database = await openDatabase();
        const results = await database.executeSql(
            'SELECT * FROM travels WHERE child_id = ? ORDER BY travel_date DESC',
            [childId]
        );
        const travels = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            travels.push(results[0].rows.item(i));
        }

        return travels;
    } catch (error) {
        console.error('Error getting travels:', error);
        throw error;
    }
};

/**
 * Çocuğu güncelle
 */
export const updateChild = async (id, name, cardNumber, cardType, photo) => {
    try {
        const database = await openDatabase();
        await database.executeSql(
            'UPDATE children SET name = ?, card_number = ?, card_type = ?, photo = ? WHERE id = ?',
            [name, cardNumber, cardType, photo, id]
        );
    } catch (error) {
        console.error('Error updating child:', error);
        throw error;
    }
};

/**
 * Çocuğu sil
 */
export const deleteChild = async (id) => {
    try {
        const database = await openDatabase();
        // Önce ilişkili işlemleri ve yolculukları sil
        await database.executeSql('DELETE FROM transactions WHERE child_id = ?', [id]);
        await database.executeSql('DELETE FROM travels WHERE child_id = ?', [id]);
        await database.executeSql('DELETE FROM children WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error deleting child:', error);
        throw error;
    }
};

/**
 * Çocuğun son işlemlerini getir (özet için)
 */
export const getRecentTransactions = async (childId, limit = 5) => {
    try {
        const database = await openDatabase();
        const results = await database.executeSql(
            'SELECT * FROM transactions WHERE child_id = ? ORDER BY transaction_date DESC LIMIT ?',
            [childId, limit]
        );
        const transactions = [];

        for (let i = 0; i < results[0].rows.length; i++) {
            transactions.push(results[0].rows.item(i));
        }

        return transactions;
    } catch (error) {
        console.error('Error getting recent transactions:', error);
        throw error;
    }
};
