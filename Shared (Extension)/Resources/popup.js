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
    browser.tabs.sendMessage(tab.id, { value })
}


if (!stateSwitch){
    var stateSwitch = stateSwitchOff;
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

