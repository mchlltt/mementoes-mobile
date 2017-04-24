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
                let entryDates = [];
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
    content: {
        flex: 1,
        backgroundColor: '#3ca2e0',
        paddingTop: 10,
        justifyContent: 'flex-start'
    },
    loading: {
        flex: 1
    }
});
