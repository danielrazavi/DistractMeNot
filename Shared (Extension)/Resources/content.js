//Content.js
let value = false;
browser.storage.local.get('switchState',(response) => {
    value = response;
});

let pageElements = ["secondary-inner", "comments"];

const toggleDistraction = (value) => {

    var element;
    pageElements.forEach(elementId => {
        element = document.getElementById(elementId);
        if (value) {
            element.style.display = "none";
        } else {
            element.style.display = "block";
        }
    });
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        
    if (request.triggerSwitchState == true){
        value = !value;
        toggleDistraction(value);
    }
    
});
