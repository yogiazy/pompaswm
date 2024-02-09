const host = "broker.hivemq.com";
const port = 8884;

const client = new Paho.MQTT.Client(host, port, "clientId_" + parseInt(Math.random() * 100, 10));

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({
    onSuccess: onConnect,
});


function onConnect() {
    console.log(`onConnect`);
    client.subscribe(`ADRSWM/PD/TIMER`);
    message = new Paho.MQTT.Message("CEK_TIMER");
    message.destinationName = "ADRSWM/PD/CEK_TIMER";
    client.send(message);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        // location.reload();
    }
}

const currentON = document.getElementById("timer_on");
const currentOFF = document.getElementById("timer_off");
const currentTimerON = document.getElementById("leftON");
const currentTimerOFF = document.getElementById("leftOFF");
function onMessageArrived(message) {
    // console.log("onMessageArrived:" + message.payloadString);
    let data = JSON.parse(message.payloadString);
    // console.log(data);

    if (data.timer_off === "on" && data.timer_on === "on") {
        currentON.value = data.current_on;
        currentOFF.value = data.current_off;
    } else if (data.timer_on === "on") {
        currentTimerOFF.value = data.timer_off;
        if (data.timer_off === 1) {
            setTimeout(function() {
                currentTimerOFF.value = 0;
            }, 1000);
        }
    } else if (data.timer_off === "on") {
        currentTimerON.value = data.timer_on;
        if (data.timer_on === 1) {
            setTimeout(function() {
                currentTimerON.value = 0;
            }, 1000);
        }
    }
}

setTimeout(function () {
    const toggleAuto = document.getElementById('toggleAuto');
    const autoText = document.getElementById('autoText');
    const manualText = document.getElementById('manualText');
    const btnStart = document.getElementById('btn_start');
    let control = true;

    toggleAuto.addEventListener('change', function () {
        if (this.checked) {
            control = true;
            autoText.style.color = '#0bc2b9';
            manualText.style.color = '#666';
            toggleSwitch.disabled = true;
            btnStart.disabled = false;
        } else {
            control = false;
            manualText.style.color = '#0bc2b9';
            autoText.style.color = '#666';
            toggleSwitch.disabled = false;
            btnStart.disabled = true;
        }
    });
}, 500);

const toggleSwitch = document.getElementById('toggleSwitch');
const toggleText = document.getElementById('toggleText');
const pumpON = document.getElementById('pump_on');
const pumpOFF = document.getElementById('pump_off');

function pump_on() {
    toggleText.textContent = 'ON';
    pumpOFF.style.display = 'none';
    pumpON.style.display = 'inline-block';
    message = new Paho.MQTT.Message("1");
    message.destinationName = "ADRSWM/PD/BTN_ON_OFF";
    client.send(message);
}

function pump_off() {
    toggleText.textContent = 'OFF';
    pumpON.style.display = 'none';
    pumpOFF.style.display = 'inline-block';
    message = new Paho.MQTT.Message("0");
    message.destinationName = "ADRSWM/PD/BTN_ON_OFF";
    client.send(message);
}

toggleSwitch.addEventListener('change', function () {
    if (this.checked) {
        pump_on();
    } else {
        pump_off();
    }
});

async function addComponent(id, comp) {
    try {
        const myHeader = document.getElementById(id);
        const response = await fetch(`./component/${comp}.html`);

        if (!response.ok) {
            throw new Error(`Failed to fetch component: ${response.status}`);
        }

        const htmlContent = await response.text();
        myHeader.innerHTML = htmlContent;
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (window.innerWidth <= 768) {
        addComponent("myNav", "navMobile");
    } else {
        addComponent("myNav", "navDekstop");
    }
});

let flagSet = true;
function btnSetup(id, topic) {
    flagSet = false;
    const value = document.getElementById(id).value;
    message = new Paho.MQTT.Message(value);
    message.destinationName = topic;
    client.send(message);
    setTimeout(function () {
        flagSet = true;
    }, 200);
}

function btnStart() {
    pump_on();
    toggleSwitch.checked = true;
    const b = document.getElementById("btn_start");
    const b2 = document.getElementById("btn_stop");
    b.classList.add("hidden");
    b2.classList.remove("hidden");
    message = new Paho.MQTT.Message("true");
    message.destinationName = "ADRSWM/PD/BTN_START";
    client.send(message);
}

function btnStop() {
    pump_off();
    toggleSwitch.checked = false;
    const b = document.getElementById("btn_stop");
    const b2 = document.getElementById("btn_start");
    b.classList.add("hidden");
    b2.classList.remove("hidden");
    message = new Paho.MQTT.Message("false");
    message.destinationName = "ADRSWM/PD/BTN_STOP";
    client.send(message);
}
