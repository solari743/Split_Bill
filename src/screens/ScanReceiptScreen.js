import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadReceipt } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function ScanReceiptScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const processReceipt = async () => {
    if (!image) return;
    try {
      setProcessing(true);
      const data = await uploadReceipt(image);
      setImage(null);
      navigation.navigate('ReceiptReview', { receiptDraft: data.receiptDraft });
    } catch (error) {
      Alert.alert('Receipt upload failed', error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.messageScreen}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.messageScreen}>
        <Ionicons name="camera-outline" size={34} color={theme.textTertiary} />
        <Text style={styles.messageTitle}>Camera unavailable</Text>
        <Text style={styles.messageText}>Choose a receipt from your gallery to continue.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>Choose from gallery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (image) {
    return (
      <View style={styles.previewScreen}>
        <Image source={{ uri: image }} style={styles.preview} />
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setImage(null)}>
            <Ionicons name="close" size={20} color={theme.text} />
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={processReceipt} disabled={processing}>
            <Ionicons name="checkmark" size={20} color="#000" />
            <Text style={styles.primaryButtonText}>{processing ? 'Processing...' : 'Process'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={(ref) => setCamera(ref)}>
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Frame the receipt</Text>
            <Text style={styles.instructionText}>Keep all totals visible and avoid glare.</Text>
          </View>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.roundButton} onPress={pickImage}>
          <Ionicons name="images-outline" size={26} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.roundButtonPlaceholder} />
      </View>
    </View>
  );
}

const createCorner = (vertical, horizontal, theme) => ({
  position: 'absolute',
  [vertical]: -2,
  [horizontal]: -2,
  width: 34,
  height: 34,
  borderColor: theme.primary,
  ...(vertical === 'top' ? { borderTopWidth: 4 } : { borderBottomWidth: 4 }),
  ...(horizontal === 'left' ? { borderLeftWidth: 4 } : { borderRightWidth: 4 }),
});

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  scanArea: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 0.72,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  cornerTopLeft: createCorner('top', 'left', theme),
  cornerTopRight: createCorner('top', 'right', theme),
  cornerBottomLeft: createCorner('bottom', 'left', theme),
  cornerBottomRight: createCorner('bottom', 'right', theme),
  instructions: { marginTop: 22, alignItems: 'center' },
  instructionTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  instructionText: { color: '#C8D0CA', fontSize: 14, marginTop: 4, textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 28,
    backgroundColor: '#000',
  },
  roundButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButtonPlaceholder: { width: 54 },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.primary,
  },
  previewScreen: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, resizeMode: 'contain' },
  previewActions: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 24, backgroundColor: theme.background },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: { color: '#000', fontWeight: '800', fontSize: 15 },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: { color: theme.text, fontWeight: '800', fontSize: 15 },
  messageScreen: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  messageTitle: { color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 12 },
  messageText: { color: theme.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 18 },
});
