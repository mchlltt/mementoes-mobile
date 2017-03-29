import React, {Component} from 'react';
import {
    ActivityIndicator,
    Alert,
    AppRegistry,
    AsyncStorage,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableNativeFeedback,
    View
} from 'react-native';
import * as simpleAuthProviders from 'react-native-simple-auth';
import secrets from './secrets';
import Calendar from 'react-native-calendar';
import moment from 'moment';
import {StackNavigator, NavigationActions} from 'react-navigation';

const backAction = NavigationActions.back();

class HomeScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {loading: true};
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
                    token: false
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
            loading: true
        });
        simpleAuthProviders[provider](opts)
            .then((info) => {
                _this.setState({
                    loading: false
                });
                AsyncStorage.setItem('id_token', info.user.id);
                navigate('Calendar', {token: info.user.id});
            })
            .catch((error) => {
                _this.setState({
                    loading: false
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
                    !this.state.token &&
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
            left: null,
            right: (
                <Button
                    title='Log Out'
                    onPress={() => AsyncStorage.removeItem('id_token').then(() => {navigate('Home')})}
                />
            ),
            style: {paddingRight: 5}
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
                    entryDates.push(response.date.split('T')[0]);
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
                <Button
                    title='Refresh'
                    onPress={this.fetchData.bind(this, params)}
                    color='purple'
                />
                <ActivityIndicator
                    animating={this.state.loading}
                    style={[styles.loading]}
                    size='large'/>
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
        title: ({ state }) => `Entries on ${moment(state.params.date).format('MMMM Do[,] YYYY')}`
    };

    handleEntrySubmit() {
        this.postData(this.state.entry);
        this.setState({ entry: '' });
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

        return(
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
        this.setState({entry: params.entryText});
    }

    static navigationOptions = {
        title: ({ state }) => `${moment(state.params.date).format('MMMM Do[,] YYYY')}`,
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

        fetch('http://mementoes.herokuapp.com/api/entries/',
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
                    text: this.state.entry
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

        return(
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

const Mementoes = StackNavigator({
        Home: {screen: HomeScreen},
        Calendar: {screen: CalendarScreen},
        Day: {screen: DayScreen},
        Entry: {screen: EntryScreen}
    },
    {
        headerMode: 'screen'
    });

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