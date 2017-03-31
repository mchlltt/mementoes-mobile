import React, {Component} from 'react';
import {
    AsyncStorage,
    StyleSheet,
    Text,
    TimePickerAndroid,
    View
} from 'react-native';
import moment from 'moment';
import SettingsList from 'react-native-settings-list';
import PushNotification from 'react-native-push-notification';
import * as Keychain from 'react-native-keychain';

PushNotification.configure({
    onNotification: function (notification) {
    },
    popInitialNotification: true,
    requestPermissions: true
});

export default class SettingsScreen extends Component {
    constructor() {
        super();
        this.state = {loaded: false};
    }

    static navigationOptions = {
        title: 'Settings'
    };

    componentWillMount() {
        function formatTime(hour, minute) {
            return hour + ':' + (minute < 10 ? '0' + minute : minute);
        }

        AsyncStorage.multiGet(['enabled', 'hour', 'minute']).then((value) => {
            // If the hour value isn't null,
            if (value[1][1]) {
                // Enabled is whether the first value is the string 'true'.
                let enabled = 'true' === value[0][1];
                let hour = parseInt(value[1][1], 10);
                let minute = parseInt(value[2][1], 10);

                this.setState({
                    switchValue: enabled,
                    presetHour: hour,
                    presetMinute: minute,
                    presetText: formatTime(hour, minute),
                    loaded: true
                });
            } else {
                this.setState({
                    switchValue: false,
                    presetHour: 17,
                    presetMinute: 0,
                    presetText: '17:00',
                    loaded: true
                });
            }
        });
    }

    navigateToSetting(page, navigate, params) {
        navigate(page, {
            token: params.token
        });
    }

    cancelNotifications() {
        PushNotification.cancelAllLocalNotifications();
    }

    scheduleNotification() {
        // Get rid of any old notifications.
        this.cancelNotifications();

        // Compare right now to the time specified for notification.
        let now = moment();
        let notification = moment().hours(this.state.presetHour).minutes(this.state.presetMinute).seconds(0);

        // If that time has already passed today, add another day before scheduling the first notification.
        if (now.isSameOrAfter(notification)) {
            notification.add(1, 'days');
        }

        // Set up the new notifications
        PushNotification.localNotificationSchedule({
            message: 'What made you happy today?',
            vibrate: true,
            vibration: 300,
            ongoing: false,
            playSound: false,
            repeatType: 'day',
            // Convert moment back to Date object.
            date: notification.toDate()
        });
    }

    showPicker = async (stateKey, options) => {
        const {action, minute, hour} = await TimePickerAndroid.open(options);
        let newState = {};
        if (action === TimePickerAndroid.timeSetAction) {
            newState[stateKey + 'Text'] = hour + ':' + (minute < 10 ? '0' + minute : minute);
            newState[stateKey + 'Hour'] = hour;
            newState[stateKey + 'Minute'] = minute;
            this.setState(newState);

            this.handleValueChange(this.state.switchValue);
        }
    }

    handleValueChange(value) {
        // Write the value and hour/minute to AsyncStorage.
        AsyncStorage.multiSet([['enabled', value.toString()], ['hour', this.state.presetHour.toString()], ['minute', this.state.presetMinute.toString()]])
            .catch((err) => console.log(err));

        // If the switch is on, schedule notifications.
        if (this.state.switchValue) {
            this.scheduleNotification();
            // Otherwise, cancel them.
        } else {
            this.cancelNotifications();
        }
    }

    logOut(navigate) {
        PushNotification.cancelAllLocalNotifications();
        Keychain.resetGenericPassword().then(() => {
            AsyncStorage.multiRemove(['hour', 'minute', 'enabled']).then(() => {
                navigate('Home')
            })
        })

    }

    render() {
        const {navigate} = this.props.navigation;
        const {params} = this.props.navigation.state;

        return (
            <View style={styles.content}>
                {this.state.loaded &&
                <SettingsList borderColor='#d6d5d9' defaultItemSize={50}>
                    <SettingsList.Item
                        hasNavArrow={false}
                        title='Daily Reminder'
                        titleStyle={{color: '#009688', marginBottom: 10, fontWeight: '500'}}
                        itemWidth={50}
                        borderHide={'Both'}
                    />
                    <SettingsList.Item
                        hasNavArrow={false}
                        itemWidth={70}
                        switchState={this.state.switchValue}
                        switchOnValueChange={(value) => {
                            this.setState({switchValue: value});
                            this.handleValueChange(value);
                        }}
                        hasSwitch={true}
                        titleStyle={{color: 'black', fontSize: 16}}
                        title='Activate Reminder'
                    />
                    <SettingsList.Item
                        hasNavArrow={false}
                        itemWidth={70}
                        titleStyle={{color: 'black', fontSize: 16}}
                        titleInfo={this.state.presetText}
                        onPress={this.showPicker.bind(this, 'preset', {
                            hour: this.state.presetHour,
                            minute: this.state.presetMinute,
                        })}
                        title='Set Reminder Time'
                    />
                    <SettingsList.Header headerStyle={{marginTop: -5}}/>
                    <SettingsList.Item
                        hasNavArrow={false}
                        title='Account'
                        titleStyle={{color: '#009688', marginBottom: 10, fontWeight: 'bold'}}
                        borderHide={'Both'}
                    />
                    <SettingsList.Item
                        title='Export Data'
                        itemWidth={70}
                        titleStyle={{color: 'black', fontSize: 16}}
                        hasNavArrow={true}
                        onPress={() => this.navigateToSetting('ExportDelete', navigate, params)}
                    />
                    <SettingsList.Item
                        title='Delete Account'
                        itemWidth={70}
                        titleStyle={{color: 'black', fontSize: 16}}
                        hasNavArrow={true}
                        onPress={() => this.navigateToSetting('ExportDelete', navigate, params)}
                    />
                    <SettingsList.Item
                        title='Log Out'
                        titleInfo={'Remove data and \nnotification settings \nfrom your device'}
                        itemWidth={70}
                        titleStyle={{color: 'black', fontSize: 16}}
                        hasNavArrow={false}
                        onPress={this.logOut.bind(this, navigate)}
                    />
                </SettingsList>
                }
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3ca2e0'
    },
    content: {
        flex: 1,
        backgroundColor: '#3ca2e0',
        paddingTop: 10,
        justifyContent: 'flex-start'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        alignSelf: 'center'
    },
    button: {
        height: 36,
        flexDirection: 'row',
        borderRadius: 30,
        marginTop: 10,
        marginBottom: 10,
        justifyContent: 'center',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: 'white',
        width: '80%'
    },
    buttonBar: {
        flexDirection: 'row'
    },
    loading: {
        flex: 1
    },
    image: {
        marginTop: 20,
        flex: 2,
        alignSelf: 'center'
    },
    entryBox: {
        backgroundColor: 'white',
        minHeight: 100,
        flex: 1,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '90%',
        alignSelf: 'center',
        marginBottom: 20
    },
    entryText: {
        width: '90%',
        fontSize: 24,
    },
    exportText: {
        width: '90%',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10
    },
    input: {
        width: '90%',
        color: 'gray',
        height: 60,
        paddingLeft: 4,
        fontSize: 24,
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
        }
    },
    multilineInput: {
        width: '90%',
        color: 'gray',
        paddingLeft: 4,
        fontSize: 24,
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
        }
    }
});
