var host = "broker.hivemq.com";
var port = 8884;

var client = new Paho.MQTT.Client(host, port, "clientId_" + parseInt(Math.random() * 100, 10));

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({
    onSuccess: onConnect,
});


function onConnect() {
    console.log(`onConnect`);
    client.subscribe(`ADRSWM/PD/TIMER`);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        location.reload();
    }
}

function onMessageArrived(message) {
    console.log("onMessageArrived:" + message.payloadString);
    let data = JSON.parse(message.payloadString);
    console.log(data);
}

setTimeout(function () {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const toggleText = document.getElementById('toggleText');
    const pumpON = document.getElementById('pump_on');
    const pumpOFF = document.getElementById('pump_off');

    function lamp_on() {
        toggleText.textContent = 'ON';
        pumpOFF.style.display = 'none';
        pumpON.style.display = 'inline-block';
        message = new Paho.MQTT.Message("1");
        message.destinationName = "eggpico/raspico-2";
        client.send(message);
    }

    function lamp_off() {
        toggleText.textContent = 'OFF';
        pumpON.style.display = 'none';
        pumpOFF.style.display = 'inline-block';
        message = new Paho.MQTT.Message("0");
        message.destinationName = "eggpico/raspico-2";
        client.send(message);
    }

    toggleSwitch.addEventListener('change', function () {
        if (this.checked) {
            lamp_on();
        } else {
            lamp_off();
        }
    });

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
