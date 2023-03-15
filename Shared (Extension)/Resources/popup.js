//popup.js
const stateSwitchOn =
{
    name: "On",
    value: true,
    color: '#F5F5F5'
}

const stateSwitchOff =
{
    name: "Off",
    value: false,
    color: '#9E9E9E'
}

const sendStateSwitch = async (value) => {
    const [tab] = await browser.tabs.query({currentWindow: true, active: true})
    browser.tabs.sendMessage(tab.id, { stateSwitch: value })
}

// Used to pass messages to the main console of safari.
const debuggMe = async (mssg) => {
    const [tab] = await browser.tabs.query({currentWindow: true, active: true})
    browser.tabs.sendMessage(tab.id, { debugMessage: mssg })
}

//Check to see if the extension is on or off
var stateSwitchValue = false;
async function getStateSwitch() {
    let switchValue;
    const [tab] = await browser.tabs.query({currentWindow: true, active: true})
    await browser.tabs.sendMessage(tab.id, { questionState: true }).then((response) => {
        switchValue = response.stateSwitch;
    });

    return switchValue;
}

stateSwitchValue = await getStateSwitch();

var stateSwitch;
if (stateSwitchValue){
    stateSwitch = stateSwitchOn;
} else {
    stateSwitch = stateSwitchOff;
}

const button = document.createElement('button');
button.style.background = stateSwitch.color;
button.innerText = stateSwitch.name;

document.querySelector('#switch-container').appendChild(button);

button.addEventListener('click', e => {
    if (button.innerText == stateSwitchOff.name){
        stateSwitch = stateSwitchOn;
    } else {
        stateSwitch = stateSwitchOff;
    }
    button.style.background = stateSwitch.color
    button.innerText = stateSwitch.name
    sendStateSwitch(stateSwitch.value)
})

