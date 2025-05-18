document.addEventListener("DOMContentLoaded", () => {
    const timeDisplay = document.getElementById("log");
    chrome.runtime.onMessage.addListener((message, ) => {
        console.log("Received message:", message);
        if (message.action === "updateTime") {
            timeDisplay.textContent = `Time Spent: ${(message.timeSpent / 1000).toFixed(0)} sec`
        }else if (message.action === "pauseMessageUpdate"){
            timeDisplay.textContent = `Tracking paused. Time stored: ${(message.elapsedPausedTime / 1000).toFixed(0)} sec`

        }
    });
});
