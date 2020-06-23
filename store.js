/*
* Basic indexedDB
* */

const openIndexedDB = (index, options) => {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    const { name, indexName, index } = options;

    let db;
    let dbReq = indexedDB.open('newRelic', 1);

    dbReq.onupgradeneeded = function (event) {
        db = event.target.result;
        db.store = db.createObjectStore(name, { autoIncrement: true });
        if (index) {
            db.index = db.store.createIndex(indexName, index);
        }
    };
    return dbReq;
};


const getStoreIndexedDB = (openDB, options) => {
    const db = {};
    const { name, mode } = options;

    db.result = openDB.result;
    db.tx = db.result.transaction(name, mode);
    db.store = db.tx.objectStore(name);
    return db;
};

const saveIndexedDB = (hostName, value, index) => {
    const openDB = openIndexedDB(index, { name: 'test', indexName: 'index1' });
    let count = 0;
    openDB.onsuccess = function () {
        const db = getStoreIndexedDB(openDB, { name: 'test', mode: 'readwrite' });
        db.store.put(value);
        count += 1;
        console.log('All data stored ...', count);

    };
    return true;
};

const findIndexedDB = (valueToSearch, callback) => {
    return loadIndexedDB(null, callback, valueToSearch);
};

const loadIndexedDB = (entry, callback, valueToSearch) => {
    const openDB = openIndexedDB();

    openDB.onsuccess = function () {
        const db = getStoreIndexedDB(openDB, { name: 'test', mode: 'readwrite' });

        let getData;
        if (entry) {
            getData = db.store.get(entry);
        } else {
            getData = db.index.get(valueToSearch);
        }

        getData.onsuccess = function () {
            callback(getData.result.data);
        };

        db.tx.oncomplete = function () {
            db.result.close();
        };
    };

    return true;
};

const storeRawData = (rawData) => {
    let shortArrays = [];
    for (let i = 0; i < rawData.length; i += 500) {
        shortArrays.push(rawData.slice(i, i + 500));
    }

    for (let i = 0; i < shortArrays.length; i++) {
        for (let j = 0; j < shortArrays[i].length; j++) {
            // Change value for wherever you want
            saveIndexedDB(i, shortArrays[i][j], [shortArrays[i][j].value, shortArrays[i][j].value]);
        }
    }
};

const getRawData = (callback) => {
    const openDB = openIndexedDB();

    openDB.onsuccess = function () {
        const db = getStoreIndexedDB(openDB, { name: 'test', mode: 'readwrite' });

        let getData;
        // Testing it
        getData = db.store.getAll([2]);

        getData.onsuccess = function () {
            callback(getData.result);
        };

        db.tx.oncomplete = function () {
            db.result.close();
        };
    };

    return true;
};

export default {
    openIndexedDB, saveIndexedDB, findIndexedDB, loadIndexedDB, storeRawData, getRawData
};
