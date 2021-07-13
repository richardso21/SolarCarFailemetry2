import firebase from "firebase/app";
import "firebase/storage";
import "firebase/database";
import { InfluxDB } from "@influxdata/influxdb-client";

// firebase config and init
const firebaseConfig = {
    apiKey: "AIzaSyA5E_HWaE4GXmq8RArbRzaRw_bgxmnFxZ8",
    authDomain: "failemetry-part-2.firebaseapp.com",
    projectId: "failemetry-part-2",
    storageBucket: "failemetry-part-2.appspot.com",
    messagingSenderId: "335163718065",
    appId: "1:335163718065:web:43ccbfbd96d127181ea590",
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

// DOMselectors
const DOMselectors = {
    img: document.getElementById("main-img"),
    imgClick: document.querySelector(".img-container > a")
};

// references to firebase locations
const root = firebase.storage().ref();
const tickle = firebase.database().ref();

// init influxDB connection
const token =
    "yxCYhp_0BmOzZlhb5OSs2hJU6hfNlA2AcxreA7W-Ti9m1OKQOXBBKBLasGgS0NiXsQBTbAASJfa132I0eEYJKg==";
const org = "SITHS Solar Car";
const bucket = "2021 Failemetry 2.0";
const client = new InfluxDB({
    url: "https://us-east-1-1.aws.cloud2.influxdata.com",
    token: token,
});

// set event listener on img data change
tickle.on("value", (snapshot) => {
    const data = snapshot.val();
    DOMselectors.img.src = data.currentImgUrl;
    DOMselectors.imgClick.href = data.currentImgUrl;
});
