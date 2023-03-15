browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Received response: ", response);
});

//Content.js
let value = false;
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
    
    if (request.stateSwitch != null){
        value = request.stateSwitch;
        toggleDistraction(value);
    } else if (request.questionState == true) {
        sendResponse({ stateSwitch: value });
        console.log("the value we send to popup: ", value);
    }
    
    if (request.debugMessage != null){
        console.log("Popup debugg: ", request.debugMessage);
    }
    
});
