'use strict';
import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, Alert, TouchableOpacity, Image}from 'react-native';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';

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

	_countdown() {
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
			<View style={styles.button}><Button color={primaryColor} title='Redeem' disabled={this.state.show}
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
					this.state.show = true;
					} }
				],
				{ cancelable: false }
				);}}/>
			</View>
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
		paddingTop: 20,
		alignItems: 'center',
	},
	restaurant: {
		fontSize: 20,
	},
	title: {
		paddingTop: 10,
		fontSize: 25,
	},
	button: {
		width: '100%',
	},
	countdown: {
		fontSize: 100,
	},
	message:{
		width: '70%',
		fontSize: 15,
		color: darkGray,
	},
});