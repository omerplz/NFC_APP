/**
 * NFC Çocuk Takip Uygulaması
 * Ana uygulama bileşeni
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import ScanCardScreen from './src/screens/ScanCardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import AddChildScreen from './src/screens/AddChildScreen';
import ChildDetailScreen from './src/screens/ChildDetailScreen';

// Veritabanı
import { openDatabase } from './src/database/db';

const Stack = createNativeStackNavigator();

const App = () => {
    useEffect(() => {
        // Veritabanını başlat
        const initDatabase = async () => {
            try {
                await openDatabase();
                console.log('Database initialized successfully');
            } catch (error) {
                console.error('Error initializing database:', error);
                Alert.alert('Hata', 'Veritabanı başlatılamadı.');
            }
        };

        // Android izinlerini iste
        const requestPermissions = async () => {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.NFC,
                        {
                            title: 'NFC İzni',
                            message: 'Uygulama NFC kartları okumak için izin gerektiriyor.',
                            buttonNeutral: 'Sonra Sor',
                            buttonNegative: 'İptal',
                            buttonPositive: 'Tamam',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert(
                            'İzin Gerekli',
                            'NFC özelliğini kullanmak için izin vermeniz gerekiyor.'
                        );
                    }
                } catch (err) {
                    console.warn('Permission error:', err);
                }
            }
        };

        initDatabase();
        requestPermissions();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ScanCard" component={ScanCardScreen} />
                <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
                <Stack.Screen name="AddChild" component={AddChildScreen} />
                <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
