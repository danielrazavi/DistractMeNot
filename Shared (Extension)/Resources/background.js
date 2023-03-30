browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({'switchState': false}, () => {
        console.log("Storage Succesful");
    });
});

browser.runtime.onStartup.addListener(() => {
    browser.storage.local.get('switchState',(response) => {
        value = response.switchState;
        console.log("On startup the value is", value);
    });
    
});

// TODO: are other runtime listeners needed here?


async function executeTheScript(targetId, fileString){
    try{
        await browser.scripting.executeScript({
            target: {
                tabId: targetId,
            },
            files: [ fileString ],
        }).then(() => {console.log("script injection successful")});
    }catch (err) {
        console.error(`failed to execute script: ${err}`);
    }
}

function handleYouTubePages(tabId, url){

    // TODO: should this call be made at the end of the function?
    // TODO: maybe a good idea to send messages to content.js rather than this?
    executeTheScript(tabId, "/content.js");
    
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
    browser.storage.local.set({"youTubePage": page});
}

// function that handles what happens to the new url provided.
function urlUpdated(tabId, changeInfo, tabInfo){

    if (!tabInfo.url){
        return;
    }

    if (tabInfo.url.match("^https://www\.youtube\.com/.*$") == tabInfo.url) {
        console.log("We're in YouTube!");
        handleYouTubePages(tabId, tabInfo.url);
    } else {
        console.log("We're in a page not known to the script.");
    }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    urlUpdated(tabId, changeInfo, tabInfo);
});
