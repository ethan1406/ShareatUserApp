
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, RefreshControl} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {baseURL} from './Constants';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import { Storage } from 'aws-amplify';
import RecentOrder from './models/RecentOrder';
import {headerFontSize} from './Dimensions';


type Props = {};
export default class RecentOrderScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      recentOrders: [RecentOrder],
      refreshing: false
    };

    this.onRefresh = this.onRefresh.bind(this);
    this.fetchRecentOrders = this.fetchRecentOrders.bind(this);
  }

  async componentDidMount() {
    await this.fetchRecentOrders();
  }

    static navigationOptions = ({navigation}) => {
        return{
            headerLeft: ()=>(
              <TouchableOpacity onPress={() => navigation.goBack(null)}>
                 <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
              </TouchableOpacity>
            ),
            title: 'Recent Orders',
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



  fetchRecentOrders = async () => {
    try {
      const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
      const {data} = await axios.get(`${baseURL}/user/${amazonUserSub}/receipts`);

      let promises = await data.map( async (reward) => {
            var recentOrder = new RecentOrder(reward.time, reward.restaurantName, 
              reward.address);
            try{
              const imageUrl = await Storage.get(`restaurants/${reward.restaurantName}/cover.jpg`);
              recentOrder.setImageUrl(imageUrl);
            } catch(err) {
              console.log(err);
            }
            return recentOrder;
        });

      Promise.all(promises).then((recentOrders) =>{
          this.setState({recentOrders, refreshing: false});
      });

    } catch (err) {
      console.log(err);
    }
  };

  onRefresh = async () => {
      this.setState({refreshing: true});

      await this.fetchRecentOrders();
    }

  _lookupReceipt = (order) => {
    this.props.navigation.navigate('Receipt', {order});
  }

  render() {
    return (
      <ScrollView style={styles.container} resizeMode='contain' refreshControl={
          <RefreshControl tintColor={primaryColor} colors={[primaryColor]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
          contentContainerStyle={{flex:1, justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column'}}>
        <Text style={styles.placeholderText}> </Text>
        {this.state.recentOrders.map((order, index) => {
           const date = new Date(order.timeOfOrder);
           var hours = date.getHours();
           const pmAm = hours < 12 ? 'am' : 'pm';
           if(hours > 12) {
              hours -= 12;
           }
           return (
            <View style={styles.rewardContainer} key={index} >
              <TouchableOpacity key={index} style={{flexDirection:'row'}}
                onPress={()=> this._lookupReceipt(order)}>
                <Image style={styles.restaurantIcon} source={{uri: order.imageUrl}}/>
                <View>
                <Text style={{marginBottom: 3}}>{order.restaurantName} </Text>
                <Text style={{color: 'gray', marginBottom: 3}}>{order.address}</Text>
                <Text style={{color: 'gray', marginBottom: 15}}>{
                  date.getMonth()+1}/{date.getDate()}/{date.getFullYear()} at {hours}:{date.getMinutes()} {pmAm}
                </Text>
                </View>
              </TouchableOpacity>
              {index == this.state.recentOrders.length - 1 ? null : <View style={styles.separator}/>}
            </View>
            ); 
          })
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  rewardContainer: {
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 10,
    width:'90%',
  },
  btnText: {
    color:'white',
    textAlign:'left',
    marginLeft: 15,
    paddingTop: 10
  },
  restaurantIcon: {
    marginTop: 7,
    height: 50,
    width: 50,
    marginRight: 15,
    borderRadius: 10,
  },
  separator: {
    borderBottomWidth: 0.5,
    borderColor: 'gray',
  }
});