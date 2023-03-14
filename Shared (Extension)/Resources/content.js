browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Received response: ", response);
});

//Content.js
let value = 'false';
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
    value = request.value;
    toggleDistraction(value);
    return Promise.resolve({ isSuccessful: true });
    
});
