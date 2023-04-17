/**
 * Function that is called when the extension is installed for the first time.
 */
async function extensionInstallation(){
    browser.storage.local.set({'switchState': false})
        .then(console.log("Storage Succesful"));
    
    let tabs = await browser.tabs.query({});
    console.log("injecting all tabs:");
    for (var i = 0; i < tabs.length; i++) {
        urlUpdated(tabs[i].id, tabs[i].url);
    }
}

/**
 * Function that is called when the browser application has been opened.
 */
async function extensionOnStartupHandler(){
    console.log("extensionOnStartupHandler");
    let tabs = await browser.tabs.query({});
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].id && tabs[i].url){
            urlUpdated(tabs[i].id, tabs[i].url);
        }
    }
}

/**
 * When called, it injects the desired content script into the targeted tab.
 * @param  {[number]} targetId [The Tab ID where the content script will be injected.]
 * @param  {[string]} fileString [the file path of the content script that will be injected]
 */
async function executeTheScript(targetId, fileString){
    console.log("executeTheScript");
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
    
    console.log("urlUpdated");

    if (givenURL.match("^https://www\.youtube\.com/.*$") == givenURL) {
        executeTheScript(tabId, "/content.js").then(sendMessageToTab(tabId, { enforceScript: true }));
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
    /*// NOT NEEDED ANYMORE.
    if (request.injectContentScript == true){
        console.log("popup is requesting content script injection.");
        browser.tabs.query({active : true, currentWindow: true}, function (tabs) {
            tab = (tabs.length === 0 ? tabs : tabs[0]);
            urlUpdated(tab.id, tab.url);
            console.log("popup's request to inject content script has been done.")
        });
        sendResponse({successful: "injection successful."});
    }*/
    sendResponse({successful: "listener is not doing anything in the backend."});
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

const filter = {
    properties: ["url"]
}


// Listeners
browser.tabs.onRemoved.addListener(handleTabClosed);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    console.log("tab updated listener");
    urlUpdated(tabId, tabInfo.url)
}, filter);
browser.tabs.onActivated.addListener(focusChanged);

browser.runtime.onInstalled.addListener(extensionInstallation);
browser.runtime.onStartup.addListener(extensionOnStartupHandler);
browser.runtime.onMessage.addListener(handleMessage);


async function sendMessageToTab(givenTabId, messageContent) {
    console.log("sendMessageToTab");
    let response = await browser.tabs.sendMessage(givenTabId, messageContent);
    console.log("Message from the content script:", response);

}
