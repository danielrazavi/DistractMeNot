/**
 * Function that is called when the extension is installed for the first time.
 */
function extensionInstallation(){
    browser.storage.local.set({'switchState': false}, () => {
        console.log("Storage Succesful");
    });
}

/**
 * Function that is called when the extension is starting up.
 */
function extensionOnStartupHandler(){
    browser.storage.local.get('switchState',(response) => {
        value = response.switchState;
        browser.tabs.query({active : true, currentWindow: true}, function (tabs) {
            tab = (tabs.length === 0 ? tabs : tabs[0]);
            console.log("extension starting for the first time...")
            console.log("running urlUpdate...")
            urlUpdated(tab.id, tab.url);
        });
    });
}

/**
 * When called, it injects the desired content script into the targeted tab.
 * @param  {[number]} targetId [The Tab ID where the content script will be injected.]
 * @param  {[string]} fileString [the file path of the content script that will be injected]
 */
async function executeTheScript(targetId, fileString){
    console.log("executeTheScript", targetId, fileString);
    try{
        let result = await browser.scripting.executeScript({
            target: { tabId: targetId },
            files: [ fileString ],
        });
    }catch (error) {
        console.log("failed to execute script: ", error);
    }
}

/**
 * Will remove all specified key/value pairs from local storage.
 */
async function removeAllPageKeys(){
    try{
        // For multiple:        browser.storage.local.remove(['testy','youTubePage']);
        browser.storage.local.remove(["youTubePage"]);
    }
    catch(error){
        console.log("removeAllPageKeys failed.", error)
    }
}

/**
 * It updates the local storage key "youTubePage". It uses regex to identify the current page the user is on in YouTube.
 * @param  {[string]} url [a url address given]
 */
function handleYouTubePages(url){
    
    let page;
    
    if (url.match("^https://www\.youtube\.com/?$") == url) {
        page = "home";
    } else if (url.match("^https://www\.youtube\.com/watch.*$") == url) {
        page = "watch";
    } else if (url.match("^https://www\.youtube\.com/feed/.*$") == url) {
        page = "feed";
    } else if (url.match("^https://www\.youtube\.com/shorts/.*$") == url) {
        page = "shorts";
    } else {
        page = "other"
    }
        
    console.log("We're in YouTube ", page);
    browser.storage.local.set({'youTubePage': page});
}

/**
 * a handler function that is executed when there is a url change in a tab. It understand where the current general address is and based on that calls relative helper functions that will then inject the necessary logic needed to make said website distracting free.
 * @param  {[number]} tabId [The Tab ID where the content script will be injected.]
 * @param  {[string]} givenURL [a url address given.]
 */
async function urlUpdated(tabId, givenURL){

    if (!givenURL){
        return;
    }

    if (givenURL.match("^https://www\.youtube\.com/.*$") == givenURL) {
        console.log("In youtube page");
        let response = await browser.storage.local.get('youTubePage');
        /*
        if (response.youTubePage){
            console.log("no need for injection");
            handleYouTubePages(givenURL);
        } else {
            console.log("injecting");
            executeTheScript(tabId, "/content.js");
            removeAllPageKeys();
            handleYouTubePages(givenURL);
        }
        */
        executeTheScript(tabId, "/content.js");
        removeAllPageKeys();
        handleYouTubePages(givenURL);

    } else {
        console.log("In an unrecgonized page");
        removeAllPageKeys();
    }
}

/**
 * Receives messages sent from popup.js to handle and set into motion various tasks.
 * @param  {[object]} request [The message itself. This is a serializable object.]
 * @param  {[object]} sender [object giving details about the message sender.]
 * @param  {[function]} sendResponse [function that can be used to send a response back to the sender.]
 */
function handleMessage(request, sender, sendResponse) {
    if (request.injectContentScript == true){
        console.log("popup is requesting content script injection.");
        browser.tabs.query({active : true, currentWindow: true}, function (tabs) {
            tab = (tabs.length === 0 ? tabs : tabs[0]);
            urlUpdated(tab.id, tab.url);
        });
        sendResponse({successful: "injection successful."});
    }
    
}

/**
 * Logic to be activated when a tab or window is closed.
 * @param  {[number]} tabId [ID of the tab that closed.]
 * @param  {[object]} removeInfo [The tab's window ID, and a boolean indicating whether the window is also being closed.]
 */
function handleTabClosed(tabId, removeInfo){
    if (removeInfo.isWindowClosing){
        console.log("window closed: ", removeInfo.windowId);
    } else {
        console.log("tab closed: ", tabId);
    }
    
}

// Listeners
browser.tabs.onRemoved.addListener(handleTabClosed);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {urlUpdated(tabId, tabInfo.url)});

browser.runtime.onInstalled.addListener(extensionInstallation);
browser.runtime.onStartup.addListener(extensionOnStartupHandler);
browser.runtime.onMessage.addListener(handleMessage);
