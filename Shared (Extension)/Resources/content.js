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

function overlayCardComments(state){
    if (state){
        var videoHeight = document.querySelector("video.video-stream.html5-main-video").style.height;
        var styles = `
            .parent {
                height: ${videoHeight};
                width: 100%;
            }
            .square {
                height: 100%;
                width: 100%;
                background-color: #777;
             }
         `;
         var styleSheet = document.createElement("style");
         styleSheet.innerText = styles;
         document.head.appendChild(styleSheet);
         
         var div = document.createElement('div');
         div.innerHTML = '<div class="square"></div>';
         div.classList.add('parent')
         div.style.display = 'flex';
         div.style.justifyContent = 'center';
         document.querySelector("#secondary #secondary-inner").appendChild(div);
    } else {
        if (document.querySelector("#secondary #secondary-inner .parent")){
            document.querySelector("#secondary #secondary-inner .parent").remove();
        }
    }
}

function enforceSwitchStateOnYouTube(value) {
    // document.querySelector("#something").style.display = "none";
    
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
    
    // Subscription Choices - no shorts and less than 10 videos.
    waitForElm("#page-manager #primary #contents.style-scope.ytd-section-list-renderer").then((element) => {
        let stop = Math.min(element.childElementCount, 10);
        
        for(var i = 0, len = element.childElementCount ; i < len; ++i){
            let isShort = element.children[i].querySelectorAll("ytd-thumbnail-overlay-time-status-renderer[overlay-style='SHORTS']").length == 1;
            
            if (isShort && i < stop){
                stop+=1;
            }
            
            if (i > stop || isShort){
                visibility(value, element.children[i]);
            }
        }
        
    });
    
    // This needs to happen once, and not many times. Needs to be a singlton.
    // This also needs to be toggled, so when a false value is passed it needs to go back in and remove the parent div.
    overlayCardComments(value);

    console.log("Enforced Switch State: ", value);
}

browser.storage.onChanged.addListener((changes, area) => {
    if (area == 'local' && Object.keys(changes).length == 1 && 'switchState' in changes){
        console.log("Storage Listener: Heard a change switchState. New Value is: ", changes['switchState'].newValue);
        enforceSwitchStateOnYouTube(changes['switchState'].newValue);
    }
});


async function backgroundMessageHandler(data, sender){
    if (data.enforceScript) {
        let switchStateResponse = await browser.storage.local.get('switchState');
        state = switchStateResponse.switchState;
        if (state == true){
            console.log("Got a message from backend to enforce switchState.");
        }
        enforceSwitchStateOnYouTube(state);
        return Promise.resolve('enforceSwitchStateOnYouTube completed.');
    }
    return false;
}

browser.runtime.onMessage.addListener(backgroundMessageHandler);

//Content.js
window.onload = function() { // TODO: what does this window.onload even do? Is it being used correctly?
    browser.storage.local.get('switchState', (switchStateResponse) => {
        state = switchStateResponse.switchState;
        console.log("DistractMeNot script Injected");
        enforceSwitchStateOnYouTube(state);
    });
}
