import React, {Component} from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    View
} from 'react-native';
import Calendar from 'react-native-calendar';
import moment from 'moment';

export default class CalendarScreen extends Component {

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

        fetch('https://mementoes.herokuapp.com/api/entries/' + params.token)
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
                <View style={{height: 75, justifyContent: 'space-between', flexDirection: 'column', marginBottom: 5}}>
                    <Button
                        title='Refresh'
                        onPress={this.fetchData.bind(this, params)}
                        color='purple'
                    />
                    <Button
                        title='Settings'
                        onPress={() => this.goToSettings(navigate, params)}
                        color='red'
                    />
                </View>
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
