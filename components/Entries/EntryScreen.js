import React, {Component} from 'react';
import {
    Button,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import moment from 'moment';
import {NavigationActions} from 'react-navigation';

export default class EntryScreen extends Component {
    constructor(props) {
        super(props);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
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

        if (this.state.entry.length > 0) {
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
        } else {
            this.deleteData();
        }
    }

    handleEditSubmit(navigate) {
        this.putData();
        
        let date = navigate.state.params.date;
        let token = navigate.state.params.token;
        
        let resetAction = NavigationActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({routeName: 'Calendar', params: {token}}),
                NavigationActions.navigate({routeName: 'Day', params: {date, token}})
            ]
        });

        navigate.dispatch(resetAction);
    }

    handleEntryDelete(navigate) {
        this.deleteData();

        let date = navigate.state.params.date;
        let token = navigate.state.params.token;

        let resetAction = NavigationActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({routeName: 'Calendar', params: {token}}),
                NavigationActions.navigate({routeName: 'Day', params: {date, token}})
            ]
        });

        navigate.dispatch(resetAction);
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
                            onChangeText={(text) => this.setState({entry: text})}
                            value={this.state.entry}
                            placeholder='Memento text'
                            onSubmitEditing={this.handleEditSubmit.bind(this, navigate)}
                            onContentSizeChange={(event) => {
                                this.setState({height: event.nativeEvent.contentSize.height});
                            }}
                        />
                        <View style={{width: 130, justifyContent: 'space-between', flexDirection: 'row'}}>
                            <Button
                                title='Save'
                                color='#5cb85c'
                                onPress={this.handleEditSubmit.bind(this, navigate)}
                                accessibilityLabel='Save an edit to this Memento.'
                            />
                            <Button
                                title='Delete'
                                color='#d9534f'
                                onPress={this.handleEntryDelete.bind(this, navigate)}
                                accessibilityLabel='Delete this Memento.'
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
