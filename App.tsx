import React, { useState } from "react";
import { Button, StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

const MORSE_CODE: { [key: string]: string } = {
  a: '.-',    b: '-...',  c: '-.-.',  d: '-..',
  e: '.',     f: '..-.',  g: '--.',   h: '....',
  i: '..',    j: '.---',  k: '-.-',   l: '.-..',
  m: '--',    n: '-.',    o: '---',   p: '.--.',
  q: '--.-',  r: '.-.',   s: '...',   t: '-',
  u: '..-',   v: '...-',  w: '.--',   x: '-..-',
  y: '-.--',  z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--',
  4: '....-', 5: '.....', 6: '-....', 7: '--...',
  8: '---..', 9: '----.',
  ' ': '/',
};

export default function App() {
  const [message, setMessage] = useState('');
  const [enableTorch, setEnableTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the flashlight.</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const toggleFlashMode = (status: boolean) => {
    setEnableTorch(status);
  }

  const flashSignal = async (signal: string) => {
    const duration = signal === '.' ? 200 : 600;
    await toggleFlashMode(true);
    await new Promise((res) => setTimeout(res, duration));
    await toggleFlashMode(false);
    await new Promise((res) => setTimeout(res, 200));
  };

  const textToMorse = (text: string): string => {
    return text
      .toLowerCase()
      .split('')
      .map(char => MORSE_CODE[char] || '')
      .join(' ');
  };

  const sendMorseCode = async () => {
    const morse = textToMorse(message);

    for (const symbol of morse) {
      if (symbol === '.') {
        await flashSignal('.');
      } else if (symbol === '-') {
        await flashSignal('-');
      } else if (symbol === ' ') {
        await new Promise((res) => setTimeout(res, 400));
      } else if (symbol === '/') {
        await new Promise((res) => setTimeout(res, 800));
      }
    }
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <CameraView style={styles.camera} enableTorch={enableTorch} />
      <Text style={styles.title}>Flashlight Morse Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send Morse Code" onPress={sendMorseCode} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    width: 300,
    height: 300,
    display: 'none',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    padding: 10,
    marginVertical: 20,
    width: '100%',
    fontSize: 18,
  },
})
