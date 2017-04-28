import React, {Component} from 'react';
import {
    Button,
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
        if (this.state.entry.length > 0) {
            this.postData(this.state.entry);
            this.setState({entry: ''});
        }
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
                let entries = [];
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
                            multiline={true}
                            style={[styles.multilineInput, {height: Math.max(35, this.state.height)}]}
                            onChangeText={(text) => this.setState({entry: text})}
                            value={this.state.entry}
                            placeholder='New Memento'
                            onSubmitEditing={this.handleEntrySubmit}
                            onContentSizeChange={(event) => {
                                this.setState({height: event.nativeEvent.contentSize.height});
                            }}
                        />
                        <View style={{width: 140, justifyContent: 'space-between', flexDirection: 'row'}}>
                            <Button
                                title='Submit'
                                color='#5cb85c'
                                onPress={this.handleEntrySubmit}
                                accessibilityLabel='Submit your Memento.'
                            />
                            <Button
                                title='Reset'
                                color='#d9534f'
                                onPress={() => this.setState({entry: ''})}
                                accessibilityLabel='Reset the contents of the input box.'
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        )

    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#3ca2e0',
        paddingTop: 10,
        justifyContent: 'flex-start'
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
