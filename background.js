let activeTabId = null;
let startTime = null;
let elapsedPausedTime = 0;
let siteTimes = {};

const trackDomains = ["www.physicsandmathstutor.com", "quizlet.com"]; 
function updateDot(isTracking) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {   // get currently active window, save it in tabs variable
        if (tabs.length === 0) return; // (if no tabs), return
        let activeTab = tabs[0]; //get first and only item from tabs
        if (isTracking) {
            action = "resumeTracking";
        } else {
            action = "pauseTracking";
        }
        chrome.tabs.sendMessage(activeTab.id, { action});
    });
}
chrome.tabs.onCreated.addListener((tab)=>{
    if (!tab || !tab.url) return;
    const url = new URL(tab.url);
    if (trackDomains.includes(url.hostname)) {
        if (!startTime) {
            startTime = Date.now() - elapsedPausedTime;
            console.log("Resuming tracking:", url.hostname);
        }
        activeTabId = tabId;
    } else {
        pauseTracking();
    }
})
    
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (!tab || !tab.url) return;
        const url = new URL(tab.url);
        if (trackDomains.includes(url.hostname)) {
            if (!startTime) {
                startTime = Date.now() - elapsedPausedTime;
                console.log("Resuming tracking:", url.hostname);
            }
            activeTabId = activeInfo.tabId;
        } else {
            pauseTracking();
        }
    })
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab || !tab.url) return;
    const url = new URL(tab.url);
    if (trackDomains.includes(url.hostname) && tabId === activeTabId) {
        if (!startTime) {
            startTime = Date.now() - elapsedPausedTime;
            console.log("Resumed tracking after URL change:", url.hostname);
        }
    } else {
        pauseTracking();
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
        logTimeSpent(); 
    }
});

function safeSendMessage(message) {
    try {
        chrome.runtime.sendMessage(message, () => {
            if (chrome.runtime.lastError) {
                console.log("Popup may not be open");
            }
        });
    } catch (error) {
        console.log("Popup may not be open");
    }
}

function safeSendTabMessage(tabId, message) {
    try {
        chrome.tabs.sendMessage(tabId, message, () => {
            if (chrome.runtime.lastError) {
                console.log("Content script may not be injected in this tab");
            }
        });
    } catch (error) {
        console.log("Failed to send message to content script");
    }
}

function pauseTracking() {
    if (startTime) {
        logTimeSpent();
        elapsedPausedTime = Date.now() - startTime;
        startTime = null;
    }
    console.log(`time stored:${(elapsedPausedTime/1000)}`);
    safeSendMessage({ action: "pauseMessageUpdate", elapsedPausedTime });
    updateDot(false)

}

function logTimeSpent() {
    if (!activeTabId || !startTime) return;

    const timeSpent = (Date.now() - startTime) + elapsedPausedTime;
    elapsedPausedTime = 0; 

    console.log(`Time spent on tab: ${timeSpent / 1000} sec`);

    chrome.storage.local.get(["siteTimes"], (result) => {
        let siteTimes = result.siteTimes || {};
        siteTimes[activeTabId] = (siteTimes[activeTabId] || 0) + timeSpent;
        chrome.storage.local.set({ siteTimes });
    });

    safeSendMessage({ action: "updateTime", timeSpent });
    safeSendTabMessage(activeTabId, { action: "updateTime", timeSpent });

}


setInterval(() => {
    if (startTime) {
        logTimeSpent();
    }
}, 1000);
