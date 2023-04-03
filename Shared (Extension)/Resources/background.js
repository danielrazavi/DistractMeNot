browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({'switchState': false}, () => {
        console.log("Storage Succesful");
    });
    
});

browser.runtime.onStartup.addListener(() => {
    browser.storage.local.get('switchState',(response) => {
        value = response.switchState;
        browser.tabs.query({active : true, currentWindow: true}, function (tabs) {
            tab = (tabs.length === 0 ? tabs : tabs[0]);
            console.log("extension starting for the first time...")
            console.log("running urlUpdate...")
            urlUpdated(tab.id, tab.url);
        });
    });
});

// TODO: are other runtime listeners needed here?

async function executeTheScript(targetId, fileString){
    try{
        let result = await browser.scripting.executeScript({
            target: { tabId: targetId },
            files: [ fileString ],
        });
//        console.log("executeScript result: ", [{result}]);
    }catch (error) {
        console.log("failed to execute script: ", error);
    }
}


async function removeAllPageKeys(){
    // TODO: what will happen if key value doesn't exist in storage?
    try{
        // For multiple:        browser.storage.local.remove(['testy','youTubePage']);
        browser.storage.local.remove(["youTubePage"]);
    }
    catch(error){
        console.log("removeAllPageKeys failed.", error)
    }
}

function handleYouTubePages(tabId, url){
    
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

// function that handles what happens to the new url provided.
async function urlUpdated(tabId, givenURL){

    if (!givenURL){
        return;
    }

    if (givenURL.match("^https://www\.youtube\.com/.*$") == givenURL) {
        console.log("In youtube page");
        let response = await browser.storage.local.get('youTubePage');
        if (response.youTubePage){
            console.log("no need for injection");
            handleYouTubePages(tabId, givenURL);
        } else {
            console.log("injecting");
            executeTheScript(tabId, "/content.js");
            removeAllPageKeys();
            handleYouTubePages(tabId, givenURL);
        }

    } else {
        console.log("In an unrecgonized page");
        removeAllPageKeys();
    }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    urlUpdated(tabId, tabInfo.url);
});


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

browser.runtime.onMessage.addListener(handleMessage);
