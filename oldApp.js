import React, {Component} from 'react';
import {
    ActivityIndicator,
    Alert,
    AppRegistry,
    AsyncStorage,
    Button,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TimePickerAndroid,
    TouchableHighlight,
    TouchableNativeFeedback,
    View
} from 'react-native';
import * as simpleAuthProviders from 'react-native-simple-auth';
import secrets from './secrets';
import Calendar from 'react-native-calendar';
import moment from 'moment';
import {StackNavigator} from 'react-navigation';
import SettingsList from 'react-native-settings-list';
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
    onNotification: function (notification) {},
    popInitialNotification: true,
    requestPermissions: true
});

class HomeScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {loading: true, showButton: false};
    }

    componentDidMount() {
        const {navigate} = this.props.navigation;
        this.getToken(navigate);
    }

    getToken(navigate) {
        AsyncStorage.getItem('id_token').then((token) => {
            if (token) {
                navigate('Calendar', {token});
            } else {
                this.setState({
                    loading: false,
                    showButton: true
                });
            }
        });
    }

    static navigationOptions = {
        header: {visible: false}
    };

    onPress(provider, opts, navigate) {
        const _this = this;
        this.setState({
            loading: true,
            showButton: false
        });
        simpleAuthProviders[provider](opts)
            .then((info) => {
                _this.setState({
                    showButton: false,
                });
                AsyncStorage.setItem('id_token', info.user.id);
                navigate('Calendar', {token: info.user.id});
            })
            .catch((error) => {
                _this.setState({
                    loading: false,
                    showButton: true
                });
                Alert.alert(
                    'Authorize Error',
                    error.message
                );
            });
    }

    render() {
        const {navigate} = this.props.navigation;

        return (
            <View style={styles.content}>
                <Image source={require('./logo.png')} style={styles.image} resizeMode={Image.resizeMode.center}/>
                {
                    this.state.showButton &&
                    <TouchableHighlight
                        style={styles.button}
                        onPress={this.onPress.bind(this, 'google', secrets['google'], navigate)}>
                        <Text style={[styles.buttonText]}>Sign Up/In with Google</Text>
                    </TouchableHighlight>

                }
                <ActivityIndicator
                    animating={this.state.loading}
                    style={[styles.loading]}
                    size='large'/>
            </View>
        );
    }
}

class CalendarScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            entryDates: [],
            loading: false
        };
    }

    static navigationOptions = {
        header: ({navigate}) => ({
            title: 'Calendar',
            left: null
        })
    };


    componentWillMount() {
        const {params} = this.props.navigation.state;
        this.fetchData(params);
    }

    fetchData(params) {
        this.setState({loading: true});

        fetch('http://mementoes.herokuapp.com/api/entries/' + params.token)
            .then(response => response.json())
            .then((responseData) => {
                var entryDates = [];
                responseData.forEach(function (response) {
                    entryDates.push(moment(response.date));
                });
                if (entryDates !== this.state.entryDates) {
                    this.setState({
                        entryDates: entryDates
                    });

                }
                this.setState({loading: false});
            })
            .catch(err => console.log(err));
    }

    onPress(date, navigate, params) {
        navigate('Day', {
            date: date.split('T')[0],
            token: params.token
        });
    }

    goToSettings(navigate, params) {
        navigate('Settings', {
            token: params.token
        });
    }

    render() {
        const {navigate} = this.props.navigation;
        const {params} = this.props.navigation.state;

        return (
            <View style={styles.content}>
                <Calendar
                    customStyle={
                        {
                            weekendDayText: {
                                color: 'gray'
                            },
                            weekendHeading: {
                                color: 'gray'
                            },
                            hasEventCircle: {
                                backgroundColor: 'thistle'
                            },
                            hasEventDaySelectedCircle: {
                                backgroundColor: 'purple'
                            }
                        }
                    }
                    eventDates={this.state.entryDates}
                    showEventIndicators={true}
                    ref='calendar'
                    scrollEnabled
                    showControls
                    titleFormat={'MMMM YYYY'}
                    prevButtonText={'Prev'}
                    nextButtonText={'Next'}
                    onDateSelect={(date) => this.onPress(date, navigate, params)}
                />
                <ActivityIndicator
                    animating={this.state.loading}
                    style={[styles.loading]}
                    size='large'/>
                <Button
                    title='Refresh'
                    onPress={this.fetchData.bind(this, params)}
                    color='purple'
                    style={{alignSelf: 'flex-end'}}
                />
                <Button
                    title='Settings'
                    onPress={() => this.goToSettings(navigate, params)}
                    color='red'
                />

            </View>
        )
    }

}

class DayScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {entry: '', entries: []};
        this.handleEntrySubmit = this.handleEntrySubmit.bind(this);
        this.editEntry = this.editEntry.bind(this);
        this.postData = this.postData.bind(this);
    }

    static navigationOptions = {
        title: ({state}) => `Entries on ${moment(state.params.date).format('MMMM Do[,] YYYY')}`
    };

    handleEntrySubmit() {
        this.postData(this.state.entry);
        this.setState({entry: ''});
    }

    componentWillMount() {
        const {params} = this.props.navigation.state;
        this.fetchData(params);
    }

    editEntry(i) {
        const {navigate} = this.props.navigation;
        const {params} = this.props.navigation.state;

        navigate('Entry', {
            entryText: this.state.entries[i].text,
            entryId: this.state.entries[i].id,
            date: params.date,
            token: params.token
        });
    }

    postData(entry) {
        const {params} = this.props.navigation.state;

        fetch('http://mementoes.herokuapp.com/api/entries/',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    date: moment(params.date),
                    googleId: params.token,
                    text: entry
                })
            })
            .then(() => this.fetchData(params))
            .catch(err => console.log(err));
    }

    fetchData(params) {
        fetch('http://mementoes.herokuapp.com/api/entries/' + params.token)
            .then(response => response.json())
            .then((responseData) => {
                var entries = [];
                responseData.forEach(function (response) {
                    if (response.date.split('T')[0] === params.date) {
                        entries.push({text: response.text, date: response.date.split('T')[0], id: response.id});
                    }
                });

                this.setState({
                    entries: entries
                });
            })
            .catch(err => console.log(err));
    }

    render() {
        const {params} = this.props.navigation.state;

        return (
            <View style={styles.content}>
                <ScrollView>
                    {
                        this.state.entries.map((entry, i) => {
                            return (
                                <View style={styles.entryBox} key={i}>
                                    <TouchableNativeFeedback key={i}
                                                             onPress={this.editEntry.bind(this, i)}>
                                        <Text style={styles.entryText}>
                                            {entry.text}
                                        </Text>
                                    </TouchableNativeFeedback>
                                </View>
                            );
                        })
                    }

                    <View style={styles.entryBox}>
                        <TextInput
                            style={styles.input}
                            placeholder='New Entry'
                            onSubmitEditing={this.handleEntrySubmit}
                            onChangeText={(text) => this.setState({entry: text})}
                            value={this.state.entry}
                        />
                    </View>

                </ScrollView>
            </View>
        )

    }
}

class EntryScreen extends Component {
    constructor(props) {
        super(props);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleEntryUpdate = this.handleEntryUpdate.bind(this);
    }

    componentWillMount() {
        const {params} = this.props.navigation.state;
        this.setState({
            entry: params.entryText
        });
    }

    static navigationOptions = {
        title: ({state}) => `${moment(state.params.date).format('MMMM Do[,] YYYY')}`,
    };

    deleteData() {
        const {params} = this.props.navigation.state;

        fetch('http://mementoes.herokuapp.com/api/entries/' + params.token + '/' + params.entryId,
            {
                method: 'DELETE'
            })
            .catch(err => console.log(err));
    }

    putData() {
        const {params} = this.props.navigation.state;

        fetch('http://mementoes.herokuapp.com/api/entries',
            {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    date: moment(params.date),
                    googleId: params.token,
                    entryId: params.entryId,
                    text: this.state.entry,
                    tagless: true
                })
            })
            .catch(err => console.log(err));

    }

    handleEntryUpdate(event) {
        this.setState({
            entry: event.nativeEvent.text
        });
    }

    handleEditSubmit(navigate) {
        this.putData();
        navigate.navigate('Day', {date: navigate.state.params.date, token: navigate.state.params.token});
    }

    handleEntryDelete(navigate) {
        this.deleteData();
        navigate.navigate('Day', {date: navigate.state.params.date, token: navigate.state.params.token});
    }

    render() {
        const navigate = this.props.navigation;

        return (
            <View style={styles.content}>
                <ScrollView>
                    <View style={styles.entryBox}>
                        <TextInput
                            multiline={true}
                            style={[styles.multilineInput, {height: Math.max(35, this.state.height)}]}
                            onChange={this.handleEntryUpdate}
                            value={this.state.entry}
                            onSubmitEditing={this.handleEditSubmit.bind(this, navigate)}
                            onContentSizeChange={(event) => {
                                this.setState({height: event.nativeEvent.contentSize.height});
                            }}
                        />
                        <View style={styles.buttonBar}>
                            <Button
                                title='Save'
                                color='#5cb85c'
                                onPress={this.handleEditSubmit.bind(this, navigate)}
                            />
                            <Button
                                title='Delete'
                                color='#d9534f'
                                onPress={this.handleEntryDelete.bind(this, navigate)}
                            />
                        </View>
                    </View>

                </ScrollView>
            </View>
        )

    }

}

class SettingsScreen extends Component {
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

    handleValueChange(value){
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
        AsyncStorage.multiRemove(['id_token', 'hour', 'minute', 'enabled']).then(() => {navigate('Home')})
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

class ExportDeleteScreen extends Component {
    constructor(props) {
        super(props);
    }

    static navigationOptions = {
        title: 'Export Data'
    };

    openURL() {
        Linking.openURL('http://mementoes.herokuapp.com/');
    }

    render () {
        return (
            <View style={styles.content}>
                <View style={styles.entryBox}>
                    <Text style={styles.exportText}>
                        Data Export and Account Deletion is not yet available on Android. Please log in at
                        {'\n'}mementoes.herokuapp.com{'\n'}
                        to export your data or delete your account.
                    </Text>
                    <Button title="Launch Website" onPress={this.openURL} color="#5cb85c"/>
                </View>

            </View>
        )
    }
}

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

AppRegistry.registerComponent(
    'Mementoes',
    () => Mementoes
);