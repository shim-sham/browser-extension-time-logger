let trackingDot = document.createElement("div");
trackingDot.classList.add("tracking-dot");

document.body.appendChild(trackingDot);

trackingDot.addEventListener("mouseenter", () => {
    trackingDot.classList.add("tracking-dot--active");
    trackingDot.textContent = "Loading...";
});

trackingDot.addEventListener("mouseleave", () => {
    trackingDot.classList.remove("tracking-dot--active");
    trackingDot.textContent = "";
});

chrome.runtime.onMessage.addListener((message) => {
    if (trackingDot.classList.contains("tracking-dot--active")) {
        if (message.action === "updateTime") {
        trackingDot.textContent = `${(message.timeSpent / 1000).toFixed(0)} sec`;
    } else if (message.action === "pauseMessageUpdate") {
        trackingDot.textContent=`Tracking paused at ${(message.elapsedPausedTime / 1000).toFixed(0)} sec`
    }
   }
    
});
