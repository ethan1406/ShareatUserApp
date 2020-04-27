
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, Easing} from 'react-native';
import * as Progress from 'react-native-progress';
//import Confetti from 'react-native-confetti';
import axios from 'axios';

import {baseURL} from './Constants';
import {primaryColor, darkGray} from './Colors';


type Props = {};
export default class RewardAccumulationScreen extends Component<Props> {

  constructor(props) {
    super(props);

    var params = this.props.navigation.state.params;

    this.state = {
      merchant: {rewards:[]},
      restaurantName: params.restaurantName,
      pointAccumulated: Math.floor(params.sub_total/100),
      originalPointsAnimated: new Animated.Value(0),
      errorMessage: '',
      userInfo: params.userInfo
    };

    this.state.originalPointsAnimated.addListener(({value}) => this._value = value);
  }

  async componentDidMount() {
    if(this._confettiView) {
     this._confettiView.startConfetti();
    }
    
    const {restaurantAmazonSub} = this.props.navigation.state.params;

    try {
      const response = await axios.get(baseURL + 
        `/user/getMerchantInfo?restaurantId=${restaurantAmazonSub}`);

      const loyaltyResponse = await axios.get(baseURL + `/user/${this.state.userInfo.amazonUserSub}/loyaltyPoints`);
      const loyaltyPoints = loyaltyResponse.data;
      var originalPoints = 0;
      loyaltyPoints.forEach(loyalty => {
        if(loyalty.restaurantId == restaurantAmazonSub) {
          originalPoints = loyalty.points;
        }
      });
      this.state.originalPointsAnimated.setValue(originalPoints);
      this.setState({merchant : response.data});
      this._spin();
      //setTimeout(function(){ this.setState({testing: 50}); }.bind(this), 1000);
    } catch (err) {
      console.log(err);
    }
  }

  _spin = () => {
    Animated.timing(
      this.state.originalPointsAnimated,
      {
        toValue: this.state.originalPointsAnimated._value + this.state.pointAccumulated,
        duration: 1200,
        easing: Easing.linear
      }
    ).start(() => this.forceUpdate());
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerRight: ( 
        <TouchableOpacity onPress={() => navigation.navigate('Check')}>
          <Text style={{color: primaryColor, marginRight: 20}}> DONE </Text>
        </TouchableOpacity>
      ),
      headerLeft: null,
      headerTransparant: true
    };
  }


//<Confetti ref={(node) => this._confettiView = node}/>
  render() {
    return (
      <View style={styles.container} resizeMode='contain'>
          <Text style={{marginTop: 100, marginBottom: 25, fontWeight: 'bold'}}> {this.state.restaurantName} </Text>
          <Text style={{marginBottom: 50}}> You have earned {this.state.pointAccumulated} points! </Text>
          <ScrollView contentContainerStyle={styles.pointsContainer} bounces={false} showsHorizontalScrollIndicator={false}>
              {this.state.merchant.rewards.map((reward, index) => (
                <TouchableOpacity style={styles.rewardContainer} key={index}>
                  <Text>{reward.reward} </Text>
                  <Animated.Text style={{color: darkGray, marginTop: 3, marginBottom: 10}}> 
                    {this.state.originalPointsAnimated._value} / {reward.pointsRequired} pts
                  </Animated.Text>
                  <Progress.Circle showsText={true} animated={true}
                    progress={this.state.originalPointsAnimated._value/reward.pointsRequired} size={90} color={primaryColor}/>
                  <Animated.Text style={{color:darkGray, marginTop: 10}}> 
                    {reward.pointsRequired - this.state.originalPointsAnimated._value} pts left
                  </Animated.Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  pointsContainer: {
    justifyContent: 'flex-start', 
    margin: 'auto',
    alignItems: 'center', 
    flexDirection: 'row'
  },
  rewardContainer: {
    marginTop: 15,
    marginLeft: 15,
    marginRight: 25
  },
  btnText: {
    color:'white',
    textAlign:'left',
    marginLeft: 15,
    paddingTop: 10
  }
});