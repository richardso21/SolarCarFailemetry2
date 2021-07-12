import { Camera } from "expo-camera";
import firebase from "firebase";
import React, { useEffect, useRef, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import {
    StyleSheet,
    Text,
    View,
    Switch,
    SafeAreaView,
    Dimensions,
    Button,
    LogBox,
    ToastAndroid,
} from "react-native";

// allow to orient both ways in landscape mode
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

// config and init firebase
const firebaseConfig = {
    apiKey: "AIzaSyA5E_HWaE4GXmq8RArbRzaRw_bgxmnFxZ8",
    authDomain: "failemetry-part-2.firebaseapp.com",
    projectId: "failemetry-part-2",
    storageBucket: "failemetry-part-2.appspot.com",
    messagingSenderId: "335163718065",
    appId: "1:335163718065:web:43ccbfbd96d127181ea590",
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const root = firebase.storage().ref();

// ignore expo warning about firebase timings
LogBox.ignoreLogs([`Setting a timer for a long period`]);

export default function App() {
    // states
    const [cameraPerm, setCameraPerm] = useState(null);
    const [cameraReady, setCameraState] = useState(false);
    const [isRecording, setRecordingStatus] = useState(false);
    // camera reference
    const cameraRef = useRef(null);

    // toggle photo record/send
    const toggleRecord = () => {
        setRecordingStatus(!isRecording);
        if (cameraRef) {
            if (!isRecording) cameraRef.current.resumePreview();
            else cameraRef.current.pausePreview();
        }
    };

    // function to take picture
    const takePicture = async () => {
        if (cameraRef && cameraReady && isRecording) {
            const data = await cameraRef.current.takePictureAsync();
            ToastAndroid.show("Picture Taken!", ToastAndroid.SHORT);
            uploadPicture(data.uri);
        }
    };

    // https://github.com/expo/examples/blob/master/with-firebase-storage-upload/App.js
    // ^^^ thank you ^^^
    // function to upload img uri to firebase storage
    const uploadPicture = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                resolve(xhr.response);
            };
            xhr.onerror = (e) => {
                console.error(e);
                ToastAndroid.show("Failed!", ToastAndroid.SHORT);
                reject(new TypeError("Network Request Failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        const now = new Date();
        const imgRef = root.child(`${now}.jpg`);
        await imgRef.put(blob);

        blob.close();
        ToastAndroid.show("Sent Successfully!", ToastAndroid.SHORT);
    };

    // ask for camera permission, stop app if not granted
    useEffect(() => {
        (async () => {
            const CameraPermStatus = await Camera.requestPermissionsAsync();
            setCameraPerm(CameraPermStatus.granted);
        })();
    }, []);

    // take pictures within intervals
    useEffect(() => {
        const interval = setInterval(() => {
            takePicture();
        }, 10000);
        return () => clearInterval(interval);
    }, [isRecording]);

    if (cameraPerm === null) return <View />;
    if (cameraPerm === false) return <Text>No access to camera.</Text>;
    return (
        <SafeAreaView style={styles.container}>
            <Camera
                style={styles.camera}
                ref={cameraRef}
                type={Camera.Constants.Type.back}
                onCameraReady={() => setCameraState(true)}
                ratio="16:9"
                useCamera2Api={true}
            >
                <View style={styles.overlay}>
                    <Text style={styles.title}>Failemetry 2.0 :P</Text>
                    <View>
                        <Text>OFF/ON</Text>
                        <Switch
                            value={isRecording}
                            onValueChange={toggleRecord}
                        />
                    </View>
                    <Button title="Manual Snap" onPress={takePicture} />
                </View>
            </Camera>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },
    camera: {
        flex: 1,
        alignSelf: "stretch",
        backgroundColor: "transparent",
    },
    overlay: {
        backgroundColor: "#aaa",
        position: "absolute",
        opacity: 0.75,
        bottom: 0,
        height: 50,
        width: Dimensions.get("window").width,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    title: {
        fontSize: 25,
    },
});
