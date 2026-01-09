import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ScanReceiptScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const processReceipt = () => {
    // Here you would add OCR/receipt scanning logic
    Alert.alert(
      'Receipt Scanned',
      'Processing receipt... (OCR integration needed)',
      [
        {
          text: 'OK',
          onPress: () => {
            setImage(null);
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (image) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.preview} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setImage(null)}
          >
            <Ionicons name="close" size={24} color="#fff" />
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={processReceipt}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.buttonText}>Process</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={(ref) => setCamera(ref)}>
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instructionText}>
            Position receipt within the frame
          </Text>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Ionicons name="images" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  galleryButton: {
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
  },
  placeholder: {
    width: 52,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6200ee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noPermissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
