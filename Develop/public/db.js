console.log('hit db.js');
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
@@ -11,7 +12,7 @@ request.onupgradeneeded = (event) => {

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};
request.onerror = (event) => {
    console("Error connecting to database: ", event.target.errorCode);
}
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            }).then(res => res.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.store("pending");
                    store.clear();
                });
        }
    };
}
window.addEventListener("online", checkDatabase);