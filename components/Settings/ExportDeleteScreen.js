import React, {Component} from 'react';
import {
    Button,
    Linking,
    StyleSheet,
    Text,
    View
} from 'react-native';


export default class ExportDeleteScreen extends Component {
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
    exportText: {
        width: '90%',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10
    }
});
