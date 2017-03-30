import React from 'react';
import {
    AppRegistry
} from 'react-native';
import {StackNavigator} from 'react-navigation';

import HomeScreen from './components/Entries/HomeScreen';
import CalendarScreen from './components/Entries/CalendarScreen';
import DayScreen from './components/Entries/DayScreen';
import EntryScreen from './components/Entries/EntryScreen';
import SettingsScreen from './components/Settings/SettingsScreen';
import ExportDeleteScreen from './components/Settings/ExportDeleteScreen';

const Mementoes = StackNavigator(
    {
        Home: {screen: HomeScreen},
        Calendar: {screen: CalendarScreen},
        Day: {screen: DayScreen},
        Entry: {screen: EntryScreen},
        Settings: {screen: SettingsScreen},
        ExportDelete: {screen: ExportDeleteScreen}
    },
    {
        headerMode: 'screen'
    }
);

AppRegistry.registerComponent(
    'Mementoes',
    () => Mementoes
);