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

function enforceSwitchStateOnYouTubeWatch(value) {
    waitForElm("#secondary-inner").then((element) => {
        visibility(value, element)
    });
    waitForElm("#comments").then((element) => {
        visibility(value, element)
    });
    waitForElm("#buttons").then((element) => {
        visibility(value, element.children[1]);
    });
    
    waitForElm(".ytp-ad-skip-button").then((element) => {
        console.log("ad skipped!");
        element.click();
    })
    
}

function enforceSwitchStateOnYouTubeHome(value) {
    waitForElm("#page-manager").then((element) => {
        visibility(value, element)
    });
    
    waitForElm("#sections").then((element) => {
        for(var i = 0, len = element.childElementCount ; i < len; ++i){
            if (i != 0 && i != 4){
                visibility(value, element.children[i]);
            }
        }
    });
    
    waitForElm("#buttons").then((element) => {
        visibility(value, element.children[1]);
    });
    
    waitForElm("#sections #items").then((element) => {
        visibility(value, element.children[1]);
    });
}

function enforceSwitchStateOnYouTubeFeed(value) {
    
    waitForElm("#sections").then((element) => {
        for(var i = 0, len = element.childElementCount ; i < len; ++i){
            if (i != 0 && i != 4){
                visibility(value, element.children[i]);
            }
        }
    });
    
    waitForElm("#buttons").then((element) => {
        visibility(value, element.children[1]);
    });
    
    waitForElm("#sections #items").then((element) => {
        visibility(value, element.children[1]);
    });
    
    //Removal of Shorts from the subscription feed.
    waitForElm("#page-manager #primary #contents").then((element) => {
        for(var i = 0, len = element.childElementCount ; i < len; ++i){
            let isShort = element.children[i].querySelectorAll("ytd-thumbnail-overlay-time-status-renderer[overlay-style='SHORTS']").length == 1;
            if (isShort){
                visibility(value, element.children[i]);
            }
        }
    });
}

function enforceSwitchStateOnYouTube(state, page){
    
    if (page == "home"){
        if (state == true){
            enforceSwitchStateOnYouTubeWatch(!state);
            enforceSwitchStateOnYouTubeFeed(!state)
        }
        enforceSwitchStateOnYouTubeHome(state);
    } else if (page == "watch"){
        if (state == true){
            enforceSwitchStateOnYouTubeHome(!state);
            enforceSwitchStateOnYouTubeFeed(!state)
        }
        enforceSwitchStateOnYouTubeWatch(state);
        
    } else if (page == "feed"){
        if (state == true){
            enforceSwitchStateOnYouTubeHome(!state);
            enforceSwitchStateOnYouTubeWatch(!state);
        }
        enforceSwitchStateOnYouTubeFeed(state)
    }
}

browser.storage.onChanged.addListener((changes, area) => {
    if (area == 'local' && Object.keys(changes).length == 1 && 'switchState' in changes){
        
        browser.storage.local.get('youTubePage',(response) => {
            page = response.youTubePage;
            console.log("Page loaded. Enforcing Switch State on Youtube with (switchState change): ", changes['switchState'].newValue, page);
            enforceSwitchStateOnYouTube(changes['switchState'].newValue, page);
        });
        
    } else if (area == 'local' && Object.keys(changes).length == 1 && 'youTubePage' in changes) {
        
        browser.storage.local.get('switchState',(response) => {
            state = response.switchState;
            console.log("Page loaded. Enforcing Switch State on Youtube with (youtubepage change): ", state, changes['youTubePage'].newValue);
            enforceSwitchStateOnYouTube(state, changes['youTubePage'].newValue);
        });
        
        // console.log(changes['youTubePage'].newValue); // TODO: this is sometimes undefined, needs to be investigated...
        
    }
    
});

//Content.js
window.onload = function() { // TODO: what does this window.onload even do? Is it being used correctly?
    browser.storage.local.get('switchState', (switchStateResponse) => {
        state = switchStateResponse.switchState;
        browser.storage.local.get('youTubePage', (youTubePageResponse) => {
            page = youTubePageResponse.youTubePage;
            browser.storage.local.remove("youTubePage"); // TODO: is this necessary? the data is on users laptop anyways? session instead?
            console.log("Page loaded. Enforcing Switch State on Youtube with begin: ", state, page);
            enforceSwitchStateOnYouTube(state, page);
        })
    });
}
