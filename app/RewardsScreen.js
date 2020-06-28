
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, 
  Image, ScrollView, StatusBar, RefreshControl} from 'react-native';
import axios from 'axios';
import {baseURL} from './Constants';
import { Storage } from 'aws-amplify';
import AsyncStorage from '@react-native-community/async-storage';
import Restaurant from './models/Restaurant';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';
import { Analytics } from 'aws-amplify';


  type Props = {};
  export default class RewardsScreen extends Component<Props> {

    constructor(props) {
      super(props);

      this.state = {
        imageUrl: '',
        restaurants: [Restaurant],
        loyaltyPoints: [],
        isLoaded: false,
        refreshing: false,
        hasNetwork: true
      };

      this.onRefresh = this.onRefresh.bind(this);
      this.fetchRewards = this.fetchRewards.bind(this);
    }

    async componentDidMount() {
      Analytics.record({
        name: 'pageView',
        attributes: {
          page: 'wallet'
        }
      });

      await this.fetchRewards();

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        async payload => {
          await this.fetchRewards();
        }
      );
    }

    // componentWillUnmount() {
    //   if (this.willFocusSubscription !== undefined) {
    //     this.willFocusSubscription.remove();
    //   }
    // }

    static navigationOptions = ({navigation}) => {
      return{
        title: 'Rewards',
        headerStyle: {
          backgroundColor: secondaryColor,
        },
        headerTintColor: darkGray,
        headerTitleStyle: {
          fontSize: headerFontSize, 
        },
        headerTitleAlign: 'center'
      };
    }

    fetchRewards = async () => {
      try {
        const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
        const {data} = await axios.get(baseURL + `/user/${amazonUserSub}/loyaltyPoints`);

        let promises = await data.map( async (reward) => {
            var restaurant = new Restaurant(reward.restaurantAmazonUserSub, reward.restaurantName, 
              reward.address, reward.description, reward.points, reward.immediateRewards, reward.redemptions);
            try{
              const imageUrl = await Storage.get(`restaurants/${reward.restaurantName}/cover.jpg`);
              restaurant.setImageUrl(imageUrl);
            } catch(err) {
              console.log(err);
            }
            return restaurant;
        });

        this.setState({loyaltyPoints: data, isLoaded: true});

        Promise.all(promises).then((restaurants) =>{
          this.setState({restaurants, refreshing: false});
        });
      } catch (err) {
        console.log(err);
        if (!err.status) {
          this.setState({hasNetwork: false});
        }
        this.setState({isLoaded: true});
      }
    }

    onRefresh = async () => {
      this.setState({refreshing: true});

      await this.fetchRewards();
    }

    _lookupRestaurant = (restaurantAmazonUserSub, restaurantName) => {

      const restaurant = this.state.restaurants.find(restaurant => restaurant.restaurantAmazonUserSub === restaurantAmazonUserSub);

      this.props.navigation.navigate('Restaurant', {
        restaurantName, restaurantAmazonUserSub, restaurant
      });
    }

    render() {
      const {loyaltyPoints} = this.state;

      var userRewardsView = null;
      var userLoyaltyProgramView = null;
      var userImmediateRewardsView = null;

      if (this.state.isLoaded) {
        if (loyaltyPoints.length == 0) {
        userRewardsView = 
          <View style={styles.noRewardsView}>
              <Text style={styles.noRewardsText}> You have no rewards currently.</Text>
              <Text style={styles.noRewardsText}> Start collecting rewards at Shareat partnered restaurants.</Text>
          </View>;
        } else {
          userLoyaltyProgramView = 
            <View>
              <Text style={styles.wallet}> Loyalty Programs </Text>
              {this.state.restaurants.map((restaurant, index) => 
                restaurant.points === 0 ? null : 
                (
                  <TouchableOpacity style={styles.rewardContainer} key={index} 
                    onPress={()=>{this._lookupRestaurant(restaurant.restaurantAmazonUserSub, restaurant.name);}}>
                    <Image style={styles.restaurantIcon}
                          source={{uri: restaurant.imageUrl}}/>
                    <View style={{flexDirection: 'column', flex: 1}}>
                      <View style={styles.restaurantInfo}>
                      <Text style={{color: '#A9A9A9', fontSize: 15, marginTop: 15, marginBottom: 3}}>{restaurant.name} </Text>
                      <Text numberOfLines={2} style={{color: '#A9A9A9', fontSize: 12,  marginBottom: 3}}>{restaurant.address} </Text>
                      <Text style={{color: 'grey', fontSize: 16, marginBottom: 10}}>{restaurant.description} </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  ))}
              </View>;

            if (this.state.restaurants.filter(restaurant => 
              (restaurant.immediateRewards !== undefined && restaurant.immediateRewards.length !== 0))
              .length !== 0) {
              userImmediateRewardsView = 
                <View>
                  <View style={styles.checkIn}>
                  <Text style={styles.wallet}> Check-In Rewards </Text>
                  </View>
                  {this.state.restaurants.map((restaurant) => (
                    restaurant.immediateRewards === undefined ? null :
                      restaurant.immediateRewards.map((immediateReward, index) => (
                        <TouchableOpacity style={styles.rewardContainer} key={index} 
                          onPress={()=>{this._lookupRestaurant(restaurant.restaurantAmazonUserSub, restaurant.name);}}>
                          <Image style={styles.restaurantIcon}
                                source={{uri: restaurant.imageUrl}}/>
                            <View style={{flexDirection: 'column', flex: 1}}>
                            <View style={styles.restaurantInfo}>
                            <Text style={{color: '#A9A9A9', fontSize: 15, marginTop: 15, marginBottom: 3}}>{restaurant.name} </Text>
                            <Text numberOfLines={2} style={{color: '#A9A9A9', fontSize: 12, marginBottom: 3}}>{restaurant.address} </Text>
                            <Text style={{color: 'grey', fontSize: 16, marginBottom: 10}}>{immediateReward.rewardName} </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    ))}
                </View>;
            }

            userRewardsView = 
              <ScrollView refreshControl={
                  <RefreshControl tintColor={primaryColor} colors={[primaryColor]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                }>
                {userLoyaltyProgramView}
                {userImmediateRewardsView}
              </ScrollView>;
        }
      }

      return (
        this.state.hasNetwork ?
        <View style={styles.container}>
          <StatusBar backgroundColor={secondaryColor} barStyle={'dark-content'}/>
          {userRewardsView}
        </View> :
        <View style={[styles.container, {alignItems: 'center'}]}>
          <Image style={{height: 100, width: 100, marginVertical: 15}} source={require('./img/ic_network_error.png')}/>
          <Text>Please make sure that you have network connection</Text>
        </View>
        );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: 'white',
      flex: 1
    },
    noRewardsView: {
      marginTop: 25,
      alignSelf: 'center'
    },
    noRewardsText: {
      color: darkGray,
      fontSize: 17,
      textAlign: 'center',
      marginTop: 10
    },
    rewardContainer: {
      marginLeft: 15,
      marginRight: 15,
      flexDirection: 'row',
    },
    logo: {
      width: '58%',
      height: 65,
      resizeMode: 'contain',
      marginLeft: 10,
      marginTop: -15,
      marginBottom: -5
    },
    divider: {
      flexDirection:'column',
      borderColor: '#A9A9A9',
      borderBottomWidth: 0.7,
      width: '90%',
      alignSelf:'center',
    },
    header: {
      alignSelf: 'flex-start',
      fontSize: 20,
      marginBottom: 10,
      marginLeft: 15,
      color: '#A9A9A9'
    },
    wallet: {
      alignSelf: 'flex-start',
      fontSize: 18,
      marginBottom: 5,
      marginLeft: 12,
      marginTop: 20,
      color: primaryColor,
    },
    restaurantIcon: {
      height: 50,
      width: 50,
      marginRight: 10,
      borderRadius: 10,
      alignSelf: 'center',
    },
    restaurantInfo: {
      flexDirection:'column',
    },
    checkIn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    distance: {
      backgroundColor: '#DCDCDC',
      marginRight: 30,
      height: 25,
      width: 65,
      alignSelf: 'center',
      alignItems: 'center',
    },
  });