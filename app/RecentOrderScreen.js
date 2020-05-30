
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {HeaderBackButton} from 'react-navigation';
import {baseURL} from './Constants';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';


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

  _lookupReceipt = (order) => {
    this.props.navigation.navigate('Receipt', {order});
  }

  render() {
    return (
      <ScrollView style={styles.container} 
        contentContainerStyle={{flex:1, justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column'}}
        resizeMode='contain'>
        <Text style={styles.placeholderText}> </Text>
        {this.state.recentOrders.map((order, index) => {
           const date = new Date(order.time);
           var hours = date.getHours();
           const pmAm = hours < 12 ? 'am' : 'pm';
           if(hours > 12) {
              hours -= 12;
           }
           return (
            <View style={styles.rewardContainer}>
            <TouchableOpacity key={index} style={{flexDirection:'row'}}
              onPress={()=> this._lookupReceipt(order)}>
              <Image style={styles.restaurantIcon} source={require('./img/splash_logo.png')}/>
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