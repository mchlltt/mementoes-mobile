import React, {Component} from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import * as simpleAuthProviders from 'react-native-simple-auth';
import * as Keychain from 'react-native-keychain';
import secrets from '../../secrets';

export default class HomeScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {loading: true, showButton: false};
    }

    componentDidMount() {
        const {navigate} = this.props.navigation;
        this.getToken(navigate);
    }

    getToken(navigate) {
        Keychain
            .getGenericPassword()
            .then((credentials) => {
                if (credentials) {
                    navigate('Calendar', {token: credentials.username});
                } else {
                    this.setState({
                        loading: false,
                        showButton: true
                    });
                }
            })
            .catch((err) => {
                this.setState({
                    err: err,
                    loading: false,
                    showButton: true
                });
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
                Keychain
                    .setGenericPassword(info.user.id, info.user.id)
                    .then(function() {
                        navigate('Calendar', {token: info.user.id});
                    });
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
                <Image source={require('../../logo.png')} style={styles.image} resizeMode={Image.resizeMode.center}/>
                <View style={{height: '30%'}}>
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
        width: '70%',
        maxWidth: 220
    },
    buttonBar: {
        flexDirection: 'row'
    },
    loading: {
        flex: 1
    },
    image: {
        marginTop: 20,
        marginBottom: 10,
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
