/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from './app/screens/Splash';
import Dashboard from './app/screens/Dashboard';
import InfoProduk from './app/screens/InfoProduk';
import Cart from './app/screens/Cart';
import Stock from './app/screens/Stock';
import Product from './app/screens/ProductList';
import Pembayaran from './app/screens/Pembayaran';
import Struk from './app/screens/Struk';
import Belanjaan from './app/screens/Belanjaan';
import Toko from './app/screens/Toko';
import Profil from './app/screens/Profil';
import About from './app/screens/About';
import InputKode from './app/screens/InputKode';
import Scanner from './app/screens/Scanner';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Splash: {
    params?: {
      handleBack?: () => void;
    };
  };
  Home: {
    params?: {
      handleBack?: () => void;
    };
  };
  Scan: {
    params?: {
      onScannedCode: (code: string) => void;
    };
  };
  InputKode: {
    params?: {
      handleBack?: () => void;
      onSubmitCode: (code: string) => void
    };
  };
  InfoProduk: {
    params?: {
      handleBack?: () => void;
    };
  };
  Cart: {
    params?: {
      handleBack?: () => void;
    };
  };
  Stock: {
    params?: {
      handleBack?: () => void;
    };
  };
  ProductList: {
    params?: {
      handleBack?: () => void;
    };
  };
  Pembayaran: {
    params?: {
      handleBack?: () => void;
    };
  };
  Struk: {
    params?: {
      handleBack?: () => void;
    };
  };
  Belanjaan: {
    params?: {
      handleBack?: () => void;
    };
  };
  Toko: {
    params?: {
      handleBack?: () => void;
    };
  };
  Profil: {
    params?: {
      handleBack?: () => void;
    };
  };
  About: {
    params?: {
      handleBack?: () => void;
    };
  };
};

function MyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Home" component={Dashboard} />
      <Stack.Screen name="Scan" component={Scanner} />
      <Stack.Screen name="InputKode" component={InputKode} />
      <Stack.Screen name="InfoProduk" component={InfoProduk} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Stock" component={Stock} />
      <Stack.Screen name="ProductList" component={Product} />
      <Stack.Screen name="Pembayaran" component={Pembayaran} />
      <Stack.Screen name="Struk" component={Struk} />
      <Stack.Screen name="Belanjaan" component={Belanjaan} />
      <Stack.Screen name="Toko" component={Toko} />
      <Stack.Screen name="Profil" component={Profil} />
      <Stack.Screen name="About" component={About} />
    </Stack.Navigator>
  );
}

class App extends Component {
  render() {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <MyStack />
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  }
}

export default App;
