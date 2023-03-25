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


const visibility = (value, element) => {
    if (value) {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}

const enforceSwitchStateOnYouTubeHome = (value) => {
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
    
    // TODO: there are two items in the html page... what am I to do?
    waitForElm("#items").then((element) => {
        visibility(value, element.children[1]);
        console.log(element.children[1]);
    });
    
    
}

browser.storage.onChanged.addListener((changes, area) => {
    console.log("content youtube home")
    if (area == 'local' &&
        Object.keys(changes).length == 1 &&
        'switchState' in changes){
        let value = changes['switchState'].newValue;
        enforceSwitchStateOnYouTubeHome(value);
    }
});


//Content.js
window.onload = function() {
    console.log("content youtube home")
    browser.storage.local.get('switchState',(response) => {
        value = response.switchState;
        // The first default enforcement.
        enforceSwitchStateOnYouTubeHome(value);
    });
}

