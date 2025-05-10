import React, { useState } from "react";
import { Button, StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { ProgressBar } from 'react-native-paper';
import { useAudioPlayer } from 'expo-audio';

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

const audioSource = require('./assets/beep.mp3');

export default function App() {
  const [message, setMessage] = useState('');
  const [enableTorch, setEnableTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [progress, setProgress] = useState(0); 
  const [isSending, setIsSending] = useState(false);
  const player = useAudioPlayer(audioSource);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the flashlight</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const flashSignal = async (signal: string) => {
    const duration = signal === '.' ? 200 : 600;
    await player.seekTo(0.5);
    await player.play();
    await new Promise((res) => setTimeout(res, 100));
    await setEnableTorch(true);
    await new Promise((res) => setTimeout(res, duration));
    await setEnableTorch(false);
    await player.pause();
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
    if (isSending) return;

    setIsSending(true);
    setProgress(0);
    const morse = textToMorse(message);
    const totalSymbols = morse.length;
    let processedSymbols = 0;

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
      processedSymbols++;
      setProgress(processedSymbols / totalSymbols);
    }

    setIsSending(false);
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
      <Button 
        title={isSending ? "Sending..." : "Send Morse Code"} 
        onPress={sendMorseCode} 
        disabled={isSending || !message.trim()}
      />
      {isSending && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color="#6200ee" 
            style={styles.progressBar} 
          />
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% complete
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: 20,
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
    textAlign: 'center',
    marginBottom: 20,
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
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    height: 10,
    width: '100%',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
})
