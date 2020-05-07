'use strict';
import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert, TouchableOpacity, Image, Modal}from 'react-native';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';
import AsyncStorage from '@react-native-community/async-storage';

type Props = {};
export default class RewardRedemptionScreen extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			min: 2,
			sec: 0,
			show: false,
			restaurant: 'Dodge Dealership',
			rewardTitle: 'One Free Hellcat',
			itemLoyaltyPointCost: 62000,
		};
	}

	static navigationOptions = ({navigation}) => {
		return {
			headerLeft:( 
				<TouchableOpacity onPress={() => navigation.goBack(null)}>
				<Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
				</TouchableOpacity>
				),
			title: 'Redeem',
			headerStyle: {
				backgroundColor: secondaryColor,
			},
			headerTitleAlign: 'center',
			headerTintColor: darkGray,
			headerTitleStyle: {
				fontSize: headerFontSize, 
			} 
		};
	}


	async componentDidMount() {
		var m, s, t;
		try {
				m = parseInt(await AsyncStorage.getItem('timer_mins'));
				s = parseInt(await AsyncStorage.getItem('timer_secs'));
				t = parseInt(await AsyncStorage.getItem('timestamp'));
				// console.log(m + ' ' + s + ' ' + t);
		} catch (e) {
			console.log(e);
		}
		if (m != null && s != null) {
			var currentDate = new Date();
			var timeDiff = (currentDate.getTime() - t) / 1000;
			m -= Math.floor(timeDiff / 60);
			s -= timeDiff % 60;
			if (s < 0) {
				s += 60;
				m--;
			}
			// console.log(timeDiff + ' ' + m + ' ' + s);
			if (m >=0 && s >= 1) {
				this.setState({
					show: true,
					min: Math.round(m),
					sec: Math.round(s),
				});
				this._countdown();
			}
		}
	}

	async componentWillUnmount() {
		var currentDate = new Date();
		try {
			AsyncStorage.setItem('timer_mins', this.state.min.toString());
			AsyncStorage.setItem('timer_secs', this.state.sec.toString());
			AsyncStorage.setItem('timestamp', currentDate.getTime().toString());
		} catch (e) {
			console.log(e);
		}
	}

	_countdown() {
		this.setState({
			show: true,
		});
		this.myInterval = setInterval(() => {
			if (this.state.sec == 0 && this.state.min != 0) {
				this.setState({
					min: this.state.min - 1,
					sec: 59,
				});
			} else if (this.state.sec == 0 && this.state.min == 0) {
				clearInterval(this.myInterval);
			} else {
				this.setState({
					sec: this.state.sec - 1,
				})
			}
        }, 1000);
	}

	render() {
		return (
			<View style={styles.container}>
			<View style={styles.info}>
			<Text style={styles.restaurant}> {this.state.restaurant} </Text>
			<Text style={styles.title}> {this.state.rewardTitle} </Text>
			</View>
			{this.state.show ? 
				(<Text style={styles.countdown}>{this.state.min}:{("0" + this.state.sec).slice(-2)}</Text>) :
				 <Text style={styles.message}>By redeeming this reward, {this.state.itemLoyaltyPointCost} loyalty points will be deducted from your current balance.</Text>}
			<TouchableOpacity style={[styles.signupBtn,{backgroundColor:this.state.show ? 'gray' : primaryColor}]} title='Redeem' disabled={this.state.show}
			onPress={()=>{Alert.alert(
				"Are you sure?",
				"You have two minutes to redeem the item",
				[
				{
					text: "Cancel",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel"
				},
				{ text: "OK", onPress: () => {this._countdown();
				} }
				],
				{ cancelable: false }
				);}}>
			<Text style={styles.btnText}>Redeem</Text>
			</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex:1,
		alignItems: 'center', 
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	info: {
		paddingTop: 50,
		alignItems: 'center',
	},
	restaurant: {
		fontSize: 20,
	},
	title: {
		paddingTop: 10,
		fontSize: 25,
	},
	countdown: {
		fontSize: 100,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center',
		backgroundColor: primaryColor,
		height: 280,
		width: 280,
		borderWidth: 5,
		borderColor: 'yellow',
		borderRadius: 140,
	},
	message:{
		width: '70%',
		fontSize: 15,
		color: darkGray,
	},
	signupBtn: {
		marginBottom: 60,
		width: '80%',
		height: 45,
		borderRadius: 40,
		alignItems: 'center',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2 // Android
    },
        btnText: {
        color:'white',
        textAlign:'center',
        paddingTop: 11,
        fontSize: 15,
    },
});