import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Linking, Text, Button} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import BarcodeMask from 'react-native-barcode-mask';
import RNFS from 'react-native-fs';
import axios from 'axios';
import ImageResizer from 'react-native-image-resizer';

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  const cameraRef = useRef({});

  const requestCameraPermission = async () => {
    return await Camera.requestCameraPermission();
  };

  const onPhotoCaptured = async ref => {
    var formData = new FormData();

    const apiKey =
      'SQSKUdOMO6BcbK1I090571wsfl0JMjWPd971AIMidtIJqWkJmL13l8umXzEjQmoP';
    const url =
      'https://asli-documents-service.dev.in.affinidi.io/api/v1/documents/extract-document';

    const photo = await ref.current.takePhoto({
      flash: 'off',
    });

    const optimize = await ImageResizer.createResizedImage(
      `file://${photo.path}`,
      1000,
      1000,
      'JPEG',
      100,
    );

    formData.append('docType', 'ADHAR');

    const uriParts = photo.path.split('.');
    const fileType = uriParts[uriParts.length - 1];
    formData.append('frontSideDocument', {
      uri: optimize,
      type: `image/${fileType}`,
      name: `${uriParts[2]}.${fileType}`,
      mimetype: `image/${fileType}`,
    });

    console.log('formData', formData);

    try {
      let myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json, text/plain');
      myHeaders.append('Content-Type', 'multipart/form-data');
      myHeaders.append('api-key', apiKey);

      fetch(url, {
        method: 'POST',
        headers: myHeaders,
        body: formData,
        redirect: 'follow',
      })
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error from catch', error));
    } catch (error) {
      console.log('errorsdfsdfs', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    requestCameraPermission().then(permission => {
      if (isMounted) {
        if (permission === 'denied') {
          Linking.openSettings();
        }
        setHasPermission(permission === 'authorized');
      }
    });
    return () => (isMounted = false);
  }, []);

  if (device == null || !hasPermission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Text>sfdfsdsfsdfdsfsdf</Text>
      <Camera
        ref={cameraRef}
        device={device}
        style={StyleSheet.absoluteFill}
        isActive={true}
        torch={'off'}
        photo={true}
      />
      <BarcodeMask
        lineAnimationDuration={2000}
        showAnimatedLine={true}
        width={280}
        height={230}
        outerMaskOpacity={0.4}
        backgroundColor="#eee"
        edgeColor={'#fff'}
        edgeBorderWidth={4}
        edgeHeight={25}
        edgeWidth={25}
        edgeRadius={5}
        animatedLineColor={'#0097AB'}
        animatedLineThickness={3}
        animatedLineOrientation="horizontal"
      />
      <Button
        onPress={() => {
          onPhotoCaptured(cameraRef);
          // onPhotoCaptured(cameraRef);
        }}
        title="Click"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000',
    //paddingVertical: 50,
  },
});

export default App;
