
'use strict';

import React, {Component} from 'react';
import {StyleSheet, ScrollView, Text, View, Image, TouchableOpacity, StatusBar, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as Progress from 'react-native-progress';
import {baseURL} from './Constants';
import axios from 'axios';
import {primaryColor, secondaryColor, gray, darkGray, turquoise} from './Colors';
import {headerFontSize} from './Dimensions';

type Props = {};
const width = Dimensions.get('window').width; 
export default class RestaurantScreen extends Component<Props> {

  constructor(props) {
    super(props);

    const { restaurant } = this.props.navigation.state.params;
    const redemptionHistory = restaurant.redemptionHistory;
    const immediateRewards = restaurant.immediateRewards;

    this.state = { 
      merchant: {rewards: []},
      redemptionHistory,
      immediateRewards,
      pointAccumulated: 0,
      errorMessage: null,
      amazonUserSub: '',
      didRedeem: false,
      redemptionReward: {
        rewardTitle: '',
        rewardId: '',
        redemptionTime: '',
        redemptionPoints: 0
      }
    };

    this.navigateToRedeemScreen = this.navigateToRedeemScreen.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerLeft: ()=>
          <TouchableOpacity onPress={() => navigation.goBack(null)}>
             <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
          </TouchableOpacity>
      ,
      title: navigation.state.params.restaurantName,
      headerStyle: {
        backgroundColor: secondaryColor,
      },
      headerTintColor: darkGray,
      headerTitleStyle: {
        fontSize: headerFontSize
      },
      headerTitleAlign: 'center'
    };
  }

  async componentDidMount() {
    
    try {
      const restaurantAmazonUserSub = this.props.navigation.state.params.restaurantAmazonUserSub;
      const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');

      const { data } = await axios.get(baseURL + 
        `/user/${amazonUserSub}/getRewards?restaurantAmazonUserSub=${restaurantAmazonUserSub}`);
      
      this.setState({merchant : data, pointAccumulated: data.points, amazonUserSub});

    } catch (err) {
      console.log(err);
      this.setState({errorMessage: err.response.data.error});
    }

    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      async payload => {
        if (this.state.didRedeem) {
          const { rewardTitle, rewardId, redemptionTime, redemptionPoints } = this.state.redemptionReward;
          
          const redemptionHistory = [...this.state.redemptionHistory, {time: redemptionTime, rewardName: rewardTitle, rewardId}];

          const immediateRewards = this.state.immediateRewards.filter(immediateReward => immediateReward.rewardId !== rewardId);

          this.setState({pointAccumulated: this.state.pointAccumulated - redemptionPoints,
            redemptionHistory,
            immediateRewards,
            didRedeem: false
          });
        }
      }
    );
  }

  rewardRedemptionHandler = (redemptionReward) => {
    this.setState({didRedeem: true, redemptionReward});
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  navigateToRedeemScreen = (pointsRequired, rewardTitle, rewardId) => {
    const { restaurantAmazonUserSub } = this.props.navigation.state.params;

    this.props.navigation.navigate('Redeem', 
      { pointsRequired, 
        restaurantName: this.props.navigation.state.params.restaurantName,
        rewardTitle,
        rewardId,
        restaurantAmazonUserSub,
        amazonUserSub: this.state.amazonUserSub,
        rewardRedemptionHandler: this.rewardRedemptionHandler
      });
  }

  formatTime = (date) => {
    var hours = date.getHours();
    const suffix = (hours >= 12)? 'pm' : 'am';
    hours = (hours > 12)? hours -12 : hours;
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month]} ${day}, ${year} at ${hours} ${suffix}`;
  }


  render() {


    var redemptionHistoryView = null;
    var immediateRewardView = null;
    if (this.state.redemptionHistory !== undefined && this.state.redemptionHistory.length > 0) {
      redemptionHistoryView = 
        <View style={{width: '100%'}}>
          <View style={styles.lineSeparator} />
          <View style={{marginHorizontal: 15}}>
            <Text style={{fontWeight: 'bold'}}> Reward Redemption History </Text>
          </View>
          {
            this.state.redemptionHistory.map((redemption, index) => {
              const localRedemptionTime = new Date(redemption.time);
              return <Text style={styles.rewardContainer} key={index}>
                  <Text style={{color: darkGray}}> {`${this.formatTime(localRedemptionTime)}\n`} </Text>
                  <Text> {redemption.rewardName} was redeemed </Text>
                </Text>;
            })
          }
        </View>;
    }

    if (this.state.immediateRewards !== undefined && this.state.immediateRewards.length > 0) {
      immediateRewardView = 
        <View style={{width: '100%'}}>
          <View style={styles.lineSeparator} />
          <View style={{marginHorizontal: 15}}>
            <Text style={{fontWeight: 'bold'}}> Check-In Rewards </Text>
          </View>
          <View style={styles.pointsContainer} >
            {
              this.state.immediateRewards.map((immediateReward, index) => {
                return   <TouchableOpacity key={index} style={{marginRight: 20}}
                            onPress={()=>this.navigateToRedeemScreen(0, immediateReward.rewardName, immediateReward.rewardId)} >
                            <Text style={{marginBottom: 10}}>{immediateReward.rewardName}</Text>
                            <Text style={{color: turquoise}}>redeem now</Text>
                        </TouchableOpacity>;
              })
            }
          </View>
        </View>;
    }

    return (
      <ScrollView resizeMode='contain' contentContainerStyle={styles.container} bounces={false} >
        <StatusBar backgroundColor={secondaryColor} barStyle={'dark-content'}/>
        <View style={{marginHorizontal: 15}}>
          <Text style={{color: 'gray', marginTop: 15}}> {this.state.merchant.description} </Text>
          <Text style={{color: 'gray', marginVertical: 5}}> {this.state.merchant.address} </Text>
        </View>
          {immediateRewardView}
          <View style={styles.lineSeparator} />
          <Text style={{fontWeight: 'bold', marginHorizontal: 15}}> Loyalty </Text>
          <Text style={{color: 'gray', marginVertical: 5, marginHorizontal: 15}}> Earn 1pt for every dollar spent </Text>
          <Text style={{color: 'black', marginVertical: 5, marginHorizontal: 15}}> You have accumulated {this.state.pointAccumulated} points in this restaurant</Text>
          <ScrollView contentContainerStyle={styles.pointsContainer} bounces={false}>
            {this.state.merchant.rewards.map((reward, index) =>  { return (reward.pointsRequired > 0) ? (
              <View style={styles.rewardContainer} key={index}>
                <TouchableOpacity onPress={()=>this.navigateToRedeemScreen(reward.pointsRequired, reward.reward, reward._id)} 
                    disabled={reward.pointsRequired > this.state.pointAccumulated} >
                  <Text>{reward.reward} </Text>
                  <Text style={{color:'gray', marginTop: 3, marginBottom: 10}}> 
                    {this.state.pointAccumulated} / {reward.pointsRequired} pts
                  </Text>
                  <Progress.Circle showsText={true} aimated={false}
                    progress={this.state.pointAccumulated/reward.pointsRequired} size={90} 
                    color={this.state.pointAccumulated >= reward.pointsRequired ? turquoise : primaryColor}/>
                  <Text style={{color:'gray', marginTop: 10}}> 
                    {(reward.pointsRequired > this.state.pointAccumulated) ?
                      `${reward.pointsRequired - this.state.pointAccumulated} pts left`
                      : 'redeem now'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
              ) : null; })}
          </ScrollView>
          {redemptionHistoryView}
          <View style={styles.lineSeparator} />
          <View style={{marginHorizontal: 15}}>
            <Text style={{fontWeight: 'bold'}}> Hours </Text>
            <Text style={{marginTop: 20}}> Monday - Friday: 7:00am - 11:00pm </Text>
            <Text> Sunday: 7:00am - 11:00pm </Text>
            <Text> Saturday: 7:00am - 11:00pm </Text>
          </View>
          <View style={styles.lineSeparator} />
          <View style={{marginHorizontal: 15}}>
          <Text style={{fontWeight: 'bold'}}> Description </Text>
          <Text style={{marginVertical: 20}}> {this.state.merchant.details} </Text>
        </View>
      </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    flexDirection: 'column'
  },
  lineSeparator: {
    borderBottomColor: gray, 
    alignSelf: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth, 
    width: width - 30,
    marginVertical: 25
  },
  rewardContainer: {
    marginTop: 15,
    marginHorizontal: 15
  },
  pointsContainer: {
    justifyContent: 'flex-start', 
    marginHorizontal: 15,
    marginVertical: 20,
    alignItems: 'center', 
    flexDirection: 'row'
  }
});