//popup.js
const switchStateOn =
{
    name: "On 🌞",
    value: true,
    color: '#FFEB3B'
}

const switchStateOff =
{
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
function switchLogic(switchStateFromStorage, button, mode) {

    if ( mode != 'init' && mode != 'click' ) {
        throw new Error('switchLogic not given correct mode.');
    }
    
    let localSwitchState;
    let updateStorage = false;
    
    if (mode == 'click'){
        switchStateFromStorage = !switchStateFromStorage;
        updateStorage = true;
    }
    
    if (switchStateFromStorage){
        localSwitchState = switchStateOn;
    } else {
        localSwitchState = switchStateOff;
    }
    
    setButtonConfigs(button, localSwitchState); // TODO: FIX: this needs a button
    
    if (updateStorage){
        setSwitchState(localSwitchState.value);
    }
    
}

/*
 1. Gets the switch state from local storage.
 2. Excutes the callback function using the switch state attained.
 */
function getSwitchState(getSwichStateCallback, button, mode) {
    browser.storage.local.get('switchState',(response) => {
        getSwichStateCallback(response.switchState, button, mode)
    });
}
/*
 1. Sets the switch state to local storage.
 */
function setSwitchState(state) {
    browser.storage.local.set({'switchState': state});
}

function createToggleButton(divName){
    const button = document.createElement(divName);
    getSwitchState(switchLogic, button, 'init');
    document.querySelector('#switch-container').appendChild(button);
    
    button.addEventListener('click', e => {
        getSwitchState(switchLogic, button, 'click');
    })
}

// Button Creation
createToggleButton('button');


