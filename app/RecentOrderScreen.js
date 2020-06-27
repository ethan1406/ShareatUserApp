
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
import { Analytics } from 'aws-amplify';


type Props = {};
export default class RecentOrderScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      recentOrders: [RecentOrder],
    };

    this.onRefresh = this.onRefresh.bind(this);
    this.fetchRecentOrders = this.fetchRecentOrders.bind(this);
  }

  async componentDidMount() {
    Analytics.record({
      name: 'pageView',
      attributes: {page: 'receipts'}
    });

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

      let promises = await data.map( async (order) => {
            var recentOrder = new RecentOrder(order.time, order.restaurantName, 
              order.address, order.totals, order.partyId, order.paymentMethod);
            try{
              const imageUrl = await Storage.get(`restaurants/${order.restaurantName}/cover.jpg`);
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
      <ScrollView resizeMode='contain' refreshControl={
          <RefreshControl tintColor={primaryColor} colors={[primaryColor]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
          contentContainerStyle={styles.container} style={{backgroundColor: 'white'}}>
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
              <TouchableOpacity key={index} style={{flexDirection:'row', width: '80%'}}
                onPress={()=> this._lookupReceipt(order)}>
                <Image style={styles.restaurantIcon} source={{uri: order.imageUrl}}/>
                <View>
                <Text style={{marginBottom: 3, marginRight: 15}}>{order.restaurantName} </Text>
                <Text style={{color: 'gray', marginBottom: 3, marginRight: 15, fontSize: 12}}>{order.address}</Text>
                {
                    order.timeOfOrder != undefined ?
                    <Text style={{color: 'gray', marginBottom: 15}}>
                        {date.getMonth()+1}/{date.getDate()}/{date.getFullYear()} at {hours}:{date.getMinutes()} {pmAm}
                    </Text> : null
                }
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
    flex:1, 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    flexDirection: 'column'
  },
  rewardContainer: {
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 10,
    width: '90%'
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