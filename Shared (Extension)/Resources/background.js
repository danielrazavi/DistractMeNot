// Set this as a default and the birthplace of where the switchState is set.
browser.storage.local.set({'switchState': false}, () => {
    console.log("Storage Succesful");
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);

    if (request.greeting === "hello")
        sendResponse({ farewell: "goodbye" });
});
