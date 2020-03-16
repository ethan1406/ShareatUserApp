
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {HeaderBackButton} from 'react-navigation';
import {baseURL} from './Constants';


type Props = {};
export default class RecentOrderScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      recentOrders: []
    };
  }

  async componentDidMount() {
    try {
      const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
      const response = await axios.get(`${baseURL}/user/${amazonUserSub}/receipts`);
      this.setState({recentOrders: response.data});
    } catch (err) {
      console.log(err);
    }
  }

    static navigationOptions = ({navigation}) => {
        return{
            headerLeft:(
              <TouchableOpacity onPress={() => navigation.goBack(null)}>
                 <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: 'white'}} source={require('./img/backbtn.png')} />
              </TouchableOpacity>
            ),
            title: 'Recent Orders',
            headerStyle: {
                backgroundColor: '#ffa91f',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
                fontSize: 18, 
                textAlign:'center',
                flex:1 ,
            } 
        };
    }

  _lookupReceipt = (order) => {
    this.props.navigation.navigate('Receipt', {order});
  }

  render() {
    return (
      <ScrollView style={styles.container} 
        contentContainerStyle={{flex:1, justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column'}}
        resizeMode='contain'>
        <Text style={styles.placeholderText}> </Text>
        <View style={[styles.headerContainer]} color='#000000'>
            <Text style={[styles.btnText]}>Recent Orders</Text>
        </View>
        {this.state.recentOrders.map((order, index) => {
           const date = new Date(order.time);
           var hours = date.getHours();
           const pmAm = hours < 12 ? 'am' : 'pm';
           if(hours > 12) {
              hours -= 12;
           }
           return (
            <TouchableOpacity style={styles.rewardContainer} key={index} 
              onPress={()=> this._lookupReceipt(order)}>
              <Text style={{marginBottom: 3}}>{order.restaurantName} </Text>
              <Text style={{color: 'gray', marginBottom: 3}}>{order.address}</Text>
              <Text style={{color: 'gray', marginBottom: 3}}>{
                date.getMonth()+1}/{date.getDate()}/{date.getFullYear()} at {hours}:{date.getMinutes()} {pmAm}
              </Text>
              {order.chargeIds.map(chargeId => 
                (<Text style={{color: 'gray', marginBottom: 3}} key={chargeId}> 
                    {`Order# ${chargeId.substr(chargeId.length - 5)}`}
                  </Text>))}
            </TouchableOpacity>
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
  headerContainer: {
    width: '100%',
    height: 35,
    backgroundColor: '#F3A545',
    borderRadius: 2,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  rewardContainer: {
    marginTop: 15,
    marginBottom: 20,
    marginLeft: 15
  },
  btnText: {
    color:'white',
    textAlign:'left',
    marginLeft: 15,
    paddingTop: 10
  }
});