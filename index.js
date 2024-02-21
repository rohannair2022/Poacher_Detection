const idxedDB = window.indexedDB;

if (!idxedDB) 
    window.alert(
        "your browser does not support indexedDB. Please use another browser."
    );
else {
    let db;
    const request = idxedDB.open("imageDB");
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        db.createObjectStore("images", {keyPath: "id"});
        request.onerror = (e) => alert("failed");
        request.onsuccess = (e) => (db = request.result);
    };
}

function writeIdxedDB(images) {
    const request = window
        .indexedDB
        .open("imageDB");
    request.onerror = (e) => {
        alert("DataBase error", e.target.errorCode);
    };
    request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction(["images"], "readwrite");
        transaction.oncomplete = (e) => {
            console.log("success");
        };
        transaction.onerror = (e) => {
            console.log("fail");
        };

        const objStore = transaction.objectStore("images");
        for (const img of images) {
            const request = objStore.add(img);
            request.onsuccess = (e) => console.log(e.target.result);
        }
    };
}

function getIdxedDBValues() {
    const request = window
        .indexedDB
        .open("imageDB");
    request.onerror = (e) => console.log(e.target.errorCode);

    request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction("images");
        transaction.onerror = (e) => console.log("fail");
        transaction.oncomplete = (e) => console.log("success");

        const objStore = transaction.objectStore("images");
        const cursorRequest = objStore.openCursor();
        cursorRequest.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                const value = objStore.get(cursor.key);
                value.onsuccess = (e) => {
                    // change this to return the result
                    console.log(e.target.result);
                };
                cursor.continue();
            }
        };
    };
}

function clearIdxedDBValue() {
    const request = window
        .indexedDB
        .open("imageDB"); // 1. db 열기
    request.onerror = (e) => console.log(e.target.errorCode);

    request.onsuccess = (e) => {
        const db = request.result;
        const transaction = db.transaction("images", "readwrite");
        transaction.onerror = (e) => console.log("fail");
        transaction.oncomplete = (e) => console.log("success");

        const objStore = transaction.objectStore("images"); // 2. name 저장소 접근
        const objStoreRequest = objStore.clear(); // 3. 전체 삭제
        objStoreRequest.onsuccess = (e) => {
            console.log("cleared");
        };
    };
}

document
    .getElementById("videoFile")
    .addEventListener("change", function (e) {
        const file = e
            .target
            .files[0];
        if (!file) {
            return;
        }
        clearIdxedDBValue();

        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const videoPreview = document.getElementById("videoPreview");
        const interval = 1000; // 4 seconds

        video.preload = "metadata";
        video.onloadedmetadata = function () {
            videoPreview.src = URL.createObjectURL(file);
            video.onloadeddata = function () {
                const frames = [];
                let currentTime = 0;

                video.onseeked = () => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        const reader = new FileReader();
                        reader.onloadend = function () {
                            const frameDataUrl = reader.result;
                            const id = currentTime; // You can use a timestamp as the ID
                            frames.push({id, frameDataUrl}); // Ensure each object has an "id" property
                            currentTime += interval / 1000;
                            extractFrame();
                        };
                        reader.readAsDataURL(blob);
                    }, "image/jpeg");
                };

                const extractFrame = () => {
                    if (currentTime >= video.duration) {
                        // All frames have been extracted
                        writeIdxedDB(frames);
                        return;
                    }
                    video.currentTime = currentTime;
                };

                extractFrame();
            };
        };
        video.src = URL.createObjectURL(file);
    });

document.addEventListener("DOMContentLoaded", function () {
    const showImagesButton = document.getElementById("showImagesButton");
    const imageContainer = document.getElementById("imageContainer");

    // Open IndexedDB database
    const request = window.indexedDB.open("imageDB");

    request.onerror = function (event) {
        console.log("IndexedDB error:", event.target.error);
    };

    request.onsuccess = function (event) {
        const db = event.target.result;

        showImagesButton.addEventListener("click", function () {
            const transaction = db.transaction(["images"], "readonly");
            const objectStore = transaction.objectStore("images");
            const request = objectStore.getAll();

            request.onerror = function (event) {
                console.log("Error fetching images:", event.target.error);
            };

            request.onsuccess = function (event) {
                // Clear previous images
                imageContainer.innerHTML = "";

                // Display images
                const images = event.target.result;
                images.forEach(function (image) {
                    const imgElement = document.createElement("img");
                    console.log(image.frameDataUrl);
                    imgElement.src = image.frameDataUrl;
                    imgElement.style.maxWidth = "200px"; // Adjust as needed
                    imgElement.style.maxHeight = "200px"; // Adjust as needed
                    imageContainer.appendChild(imgElement);
                });
            };
        });
    };
});
