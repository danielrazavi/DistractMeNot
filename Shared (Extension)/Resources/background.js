/**
 * Function that is called when the extension is installed for the first time.
 */
function extensionInstallation(){
    browser.storage.local.set({'switchState': false}, () => {
        console.log("Storage Succesful");
    });
}

/**
 * Function that is called when the browser application has been opened.
 */
function extensionOnStartupHandler(){
    browser.storage.local.get('switchState',(response) => {
        value = response.switchState;
        browser.tabs.query({active : true, currentWindow: true}, function (tabs) {
            tab = (tabs.length === 0 ? tabs : tabs[0]);
            if (tab.id && tab.url){
                urlUpdated(tab.id, tab.url);
            }
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
 * a handler function that is executed when there is a url change in a tab. It understand where the current general address is and based on that calls relative helper functions that will then inject the necessary logic needed to make said website distracting free.
 * @param  {[number]} tabId [The Tab ID where the content script will be injected.]
 * @param  {[string]} givenURL [a url address given.]
 */
async function urlUpdated(tabId, givenURL){

    if (!givenURL){
        return;
    }

    if (givenURL.match("^https://www\.youtube\.com/.*$") == givenURL) {
        executeTheScript(tabId, "/content.js");
        browser.storage.local.set({'youTubePage': 'home'});

    } else {
        console.log("In an unrecgonized page");
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

/**
 * Logic to be executed when when the user focuses on a new tab/window.
 * @param  {[object]} activeInfo [ID of the tab that was made active, and ID of its window.]
 */
async function focusChanged(activeInfo){
    let tabInfo = await browser.tabs.get(activeInfo.tabId);
    console.log("changed tabs");
    urlUpdated(activeInfo.tabId, tabInfo.url);
}

// Listeners
browser.tabs.onRemoved.addListener(handleTabClosed);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {urlUpdated(tabId, tabInfo.url)});
browser.tabs.onActivated.addListener(focusChanged);

browser.runtime.onInstalled.addListener(extensionInstallation);
browser.runtime.onStartup.addListener(extensionOnStartupHandler);
browser.runtime.onMessage.addListener(handleMessage);
