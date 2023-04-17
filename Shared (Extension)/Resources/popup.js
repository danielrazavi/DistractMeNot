//popup.js
const switchStateOn = {
    name: "On 🌞",
    value: true,
    color: '#FFEB3B'
}

const switchStateOff = {
    name: "Off 🌚",
    value: false,
    color: '#78909c'
}

function setButtonConfigs(button, switchState){
    button.style.background = switchState.color;
    button.innerText = switchState.name;
}

/*
 Decides how to set the button configuration and local storage based off of what the state of the switch currently is and whether if it is in init mode for click mode. If "init" mode, then it will simply set the button as what the state is. if "click" mode, then it toggles what the switch state is and configures the button, while updating the local storage.
 */
async function switchLogic(switchStateFromStorage, button, mode) {

    if ( mode != 'init' && mode != 'click' ) {
        throw new Error('switchLogic not given correct mode.');
    }
    
    let updateStorage = false;
    
    if (mode == 'click'){
        switchStateFromStorage = !switchStateFromStorage;
        updateStorage = true;
    }
    
    let localSwitchState;
    if (switchStateFromStorage){
        localSwitchState = switchStateOn;
    } else {
        localSwitchState = switchStateOff;
    }
    
    setButtonConfigs(button, localSwitchState);
    
    if (updateStorage){
        setSwitchState(localSwitchState.value);
    }
}

/*
 1. Gets the switch state from local storage.
 2. Excutes the callback function using the switch state attained.
 */
async function getSwitchState() {
    try{
        return browser.storage.local.get('switchState');
    }
    catch(error){
        console.log("getSwitchState failed.", error)
    }
}

/*
 1. Sets the switch state to local storage.
 */
async function setSwitchState(state) {
    try{
        browser.storage.local.set({'switchState': state});
        console.log("switch flicked.");
    } catch(error){
        console.log("setSwitchState failed", error);
    }
}

async function createToggleButton(divName){
    const button = document.createElement(divName);
    
    let response;
    try{
        response = await getSwitchState();
        switchLogic(response.switchState, button, 'init');
    }
    catch(error){
        console("ERROR IN CREATE TOGGLE BUTTON", error)
        switchLogic(false, button, 'init');
    }
    
    document.querySelector('#switch-container').appendChild(button);
    
    button.addEventListener('click', async e => {
        response = await getSwitchState();
        switchLogic(response.switchState, button, 'click');
    })
}

// Button Creation
createToggleButton('button');


function handleResponse(message) {
    console.log(`Received a Message: ${message.response}`);
}
function handleError(error) {
    console.log(`Error: ${error}`);
}

async function pingTheMainTab(tab) {
    console.log("pinging The Main Tab...");
    try {
        console.log("start");
        const response  = await browser.tabs.sendMessage(tab.id, { hello: true });
        console.log("response");
        console.log(response);
        if (response.hiBack){
            console.log("Message to Main Tab was Delivered.");
            return true;
        } else {
            console.log("Message to Main Tab was not Delivered.");
            return false;
        }
    } catch(error) {
        console.log("sendMessageToMainTab failed", error);
        return false;
    }
    
}
