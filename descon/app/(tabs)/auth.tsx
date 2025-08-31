import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';


const baseURL = "https://backend-roaddamage.onrender.com";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleAuth = async () => {
  try {
    const url = isSignUp 
    ? `${baseURL}/user/signup`
    : `${baseURL}/user/signin`;
    
    // Prepare body
    const body = isSignUp 
    ? { name, email, password } 
    : { email, password };
    

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();


    if (!res.ok) {
      console.log('Error:', data.error);
      return;
    }


    setEmail("")
    setName("")
    setPassword("")
    console.log(isSignUp ? 'Sign Up Success:' : 'Sign In Success:', data);
    

  
    // Save user id locally
    if (data.userid) {
      await AsyncStorage.setItem('user_id', data.userid.toString());
      console.log('User ID saved locally:', data.userid);
    }
    data.userid=="admin"?router.push("/(tabs)/admindash"):router.push("/(tabs)/report")
    
    
  } catch (err) {
    console.error('Network error:', err);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={isSignUp ? 'Sign Up' : 'Sign In'} onPress={handleAuth} />

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  switchText: {
    marginTop: 15,
    color: '#007BFF',
    textAlign: 'center',
  },
});
