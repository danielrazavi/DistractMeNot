function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function visibility(value, element) {
    if (value) {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}

function enforceSwitchStateOnYouTube(value) {
    // document.querySelector("#page-manager #primary .ytd-two-column-browse-results-renderer #contents").style.display = "none";
    
    // recommended video watch
    waitForElm("#secondary #secondary-inner #related").then((element) => {
        visibility(value, element)
    });
    
    // comments
    waitForElm("#comments #sections").then((element) => {
        visibility(value, element)
    });
    
    // Skipping the ads
    waitForElm(".ytp-ad-skip-button").then((element) => {
        element.click();
    })
    
    // recommend chips
    waitForElm("#page-manager #primary #header").then((element) => {
        visibility(value, element)
    });
    
    // recommendations
    waitForElm("#page-manager #primary .ytd-two-column-browse-results-renderer #contents").then((element) => {
        visibility(value, element)
    });
    
    // Side Bar - Subscriptions and Explore and Made from YouTube
    waitForElm("#sections").then((element) => {
        for(var i = 0, len = element.childElementCount ; i < len; ++i){
            if (i != 0 && i != 4){
                visibility(value, element.children[i]);
            }
        }
    });
    
    // Bell Notification Button
    waitForElm("#buttons").then((element) => {
        visibility(value, element.children[1]);
    });
    
    // Shorts Button - Side Bar
    waitForElm("#sections #items").then((element) => {
        visibility(value, element.children[1]);
    });
}

browser.storage.onChanged.addListener((changes, area) => {
    if (area == 'local' && Object.keys(changes).length == 1 && 'switchState' in changes){
        console.log("Page loaded. Enforcing Switch State on Youtube with (switchState change): ", changes['switchState'].newValue);
        enforceSwitchStateOnYouTube(changes['switchState'].newValue);
    } else if (area == 'local' && Object.keys(changes).length == 1 && 'youTubePage' in changes) {
        console.log("Page loaded. Enforcing Switch State on Youtube with (youtubepage change): ", state);
        enforceSwitchStateOnYouTube(state);
    }
});

//Content.js
window.onload = function() { // TODO: what does this window.onload even do? Is it being used correctly?
    browser.storage.local.get('switchState', (switchStateResponse) => {
        state = switchStateResponse.switchState;
        console.log("Page loaded. Enforcing Switch State on Youtube with (begin): ", state);
        enforceSwitchStateOnYouTube(state);
    });
}
