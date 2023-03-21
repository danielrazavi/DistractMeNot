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


const visibility = (value, elementId) => {
    waitForElm(elementId).then((element) => {
        if (value) {
            element.style.display = "none";
        } else {
            element.style.display = "block";
        }
    });
}

const enforceSwitchStateOnYouTubeWatch = (value) => {
    visibility(value, "#secondary-inner");
    visibility(value, "#comments");
}

browser.storage.onChanged.addListener((changes, area) => {
    if (area == 'local' &&
        Object.keys(changes).length == 1 &&
        'switchState' in changes){
        let value = changes['switchState'].newValue;
        enforceSwitchStateOnYouTubeWatch(value);
    }
});


//Content.js
window.onload = function() {
    browser.storage.local.get('switchState',(response) => {
        value = response.switchState;
        console.log("after the refresh, value is ", value);
        // The first default enforcement.
        enforceSwitchStateOnYouTubeWatch(value);
    });
}
