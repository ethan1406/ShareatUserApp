
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity,
  ScrollView} from 'react-native';
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
      originalPoints: 0,
      errorMessage: '',
      userInfo: params.userInfo
    };
  }

  async componentDidMount() {
    if(this._confettiView) {
     this._confettiView.startConfetti();
    }
    
    const { restaurantAmazonUserSub } = this.props.navigation.state.params;

    try {

      const { data } = await axios.get(baseURL + 
        `/user/${this.state.userInfo.amazonUserSub}/getRewards?restaurantAmazonUserSub=${restaurantAmazonUserSub}`);

      this.setState({merchant : data, originalPoints: data.points});
      setTimeout(function(){ this.setState({originalPoints: this.state.originalPoints + this.state.pointAccumulated}); }.bind(this), 1000);
    } catch (err) {
      console.log(err);
    }
  }


  static navigationOptions = ({navigation}) => {
    return {
      headerRight: () =>  
        <TouchableOpacity onPress={() => navigation.navigate('Check')}>
          <Text style={{color: primaryColor, marginRight: 20}}> DONE </Text>
        </TouchableOpacity>
      ,
      headerLeft: ()=> null,
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
                  <Text style={{color: darkGray, marginTop: 3, marginBottom: 10}}> 
                    {this.state.originalPoints} / {reward.pointsRequired} pts
                  </Text>
                  <Progress.Circle showsText={true} animated={true}
                    progress={this.state.originalPoints/reward.pointsRequired} size={90} color={primaryColor}/>
                  <Text style={{color:darkGray, marginTop: 10}}> 
                    {reward.pointsRequired - this.state.originalPoints} pts left
                  </Text>
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