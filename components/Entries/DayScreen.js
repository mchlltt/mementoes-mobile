import React, {Component} from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableNativeFeedback,
    View
} from 'react-native';
import moment from 'moment';

export default class DayScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {entry: '', entries: []};
        this.handleEntrySubmit = this.handleEntrySubmit.bind(this);
        this.editEntry = this.editEntry.bind(this);
        this.postData = this.postData.bind(this);
    }

    static navigationOptions = {
        title: ({state}) => `Mementoes for ${moment(state.params.date).format('MMMM Do[,] YYYY')}`
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
                    if (moment(response.date).format().split('T')[0] === params.date) {
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
                            placeholder='New Memento'
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
