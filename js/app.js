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
        location.reload();
    }
}

const currentON = document.getElementById("timer_on");
const currentOFF = document.getElementById("timer_off");
const currentTimerON = document.getElementById("leftON");
const currentTimerOFF = document.getElementById("leftOFF");
function onMessageArrived(message) {
    // console.log("onMessageArrived:" + message.payloadString);
    let data = JSON.parse(message.payloadString);
    console.log(data);

    if (data.timer_off === "on" && data.timer_on === "on") {
        currentON.value = data.current_on;
        currentOFF.value = data.current_off;
        start = data.start;
    } else if (data.timer_on === "on") {
        currentTimerOFF.value = data.timer_off;
    } else if (data.timer_off === "on") {
        currentTimerON.value = data.timer_on;
    } else if (data.timer_on === "azy") {
        if (data.status === "ON") {
            toggleText.textContent = 'ON';
            pumpOFF.style.display = 'none';
            pumpON.style.display = 'inline-block';
            toggleSwitch.checked = true;
            flagCek = true;
            if (start) {
                b.classList.add("hidden");
                b2.classList.remove("hidden");
            };
        } else if (data.status === "OFF") {
            toggleText.textContent = 'OFF';
            pumpON.style.display = 'none';
            pumpOFF.style.display = 'inline-block';
            toggleSwitch.checked = false;
            flagCek = false;
        }
    }
}

let control = true;
setTimeout(function () {
    const toggleAuto = document.getElementById('toggleAuto');
    const autoText = document.getElementById('autoText');
    const manualText = document.getElementById('manualText');
    const btnStart = document.getElementById('btn_start');

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
const toggleMode = document.getElementById('toggleMode');
const textMode = document.getElementById('textMode');
const pumpON = document.getElementById('pump_on');
const pumpOFF = document.getElementById('pump_off');

function pump_on() {
    message = new Paho.MQTT.Message("1");
    message.destinationName = "ADRSWM/PD/BTN_ON_OFF";
    client.send(message);
    cekON();
}

function pump_off() {
    message = new Paho.MQTT.Message("0");
    message.destinationName = "ADRSWM/PD/BTN_ON_OFF";
    client.send(message);
    cekOFF();
}

toggleSwitch.addEventListener('change', function () {
    if (this.checked) {
        pump_on();
    } else {
        pump_off();
    }
});

let myInv;
toggleMode.addEventListener('change', function () {
    if (this.checked) {
        textMode.textContent = "Random";
        message = new Paho.MQTT.Message("1");
        message.destinationName = "ADRSWM/PD/BTN_INTERVAL";
        client.send(message);
        myInv = setInterval(function () {
            message = new Paho.MQTT.Message("1");
            message.destinationName = "ADRSWM/PD/BTN_INTERVAL";
            client.send(message);
        }, 2000);
    } else {
        textMode.textContent = "Static"
        if (myInv) {
            clearInterval(myInv);
        }
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

function btnSetup(id, topic, set) {
    const b = document.getElementById(id);
    const s = document.getElementById(set);
    const i = s.innerHTML;
    s.innerHTML = `<i class='bx bx-log-in-circle bx-tada'></i> Setting..`;
    message = new Paho.MQTT.Message(b.value);
    message.destinationName = topic;
    client.send(message);
    setTimeout(function () {
        s.innerHTML = `<i class='bx bx-check-double'></i> Done`;
    }, 1500);
    setTimeout(function () {
        s.innerHTML = i;
    }, 2500);
}

const b = document.getElementById("btn_start");
const b2 = document.getElementById("btn_stop");
let start;
function btnStart() {
    pump_on();
    start = true;
    toggleSwitch.checked = true;
    b.classList.add("hidden");
    b2.classList.remove("hidden");
    message = new Paho.MQTT.Message("true");
    message.destinationName = "ADRSWM/PD/BTN_START";
    client.send(message);
}

function btnStop() {
    pump_off();
    start = false;
    toggleSwitch.checked = false;
    b2.classList.add("hidden");
    b.classList.remove("hidden");
    message = new Paho.MQTT.Message("false");
    message.destinationName = "ADRSWM/PD/BTN_STOP";
    client.send(message);
}

let flagCek = false;
function cekON() {
    setTimeout(function () {
        if (flagCek === false) {
            alert("Gagal mengaktifkan pompa! cek kembali konfigurasi pompa.");
            toggleSwitch.checked = false;
            b2.classList.add("hidden");
            b.classList.remove("hidden");
            message = new Paho.MQTT.Message("false");
            message.destinationName = "ADRSWM/PD/BTN_STOP";
            client.send(message);
        }
    }, 2000);
}

function cekOFF() {
    setTimeout(function () {
        if (flagCek === true) {
            alert("Gagal menonaktifkan pompa! cek kembali konfigurasi pompa.");
            toggleSwitch.checked = true;
            b.classList.add("hidden");
            b2.classList.remove("hidden");
        }
    }, 2000);
}