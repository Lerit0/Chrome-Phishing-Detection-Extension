const btn = document.querySelector(".scan-btn");
const status_circle = document.querySelector(".status");
const text = document.querySelector(".status__text");
const detail = document.querySelector(".status__detail");


const setScanning = () => {
    document.body.dataset.state = "scanning";
    text.textContent = "Scanning";
    detail.hidden = true;
};

const setIdle = () => {
    document.body.dataset.state = "idle";
    text.textContent = "Ready to check";
    detail.hidden = false;
};

btn.addEventListener("click", () => {
    setScanning();
    // Change this later, were we should call the content.js
    window.setTimeout(() => {
        setIdle();
    }, 3000);
});
