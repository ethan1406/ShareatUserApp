
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, 
  Image, ScrollView, FlatList, Dimensions} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import {baseURL} from './Constants';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';


type Props = {};
const colors = ['#F3A545', '#f85457','pink', '#8c62ca','#009cff'];
var colorIndex = 0;
const screenHeight = Dimensions.get('window').height;
const screenWidth= Dimensions.get('window').width;
export default class ReceiptScreen extends Component<Props> {

  constructor(props) {
    super(props);

    const params = this.props.navigation.state.params;

    this.state = {
      errMessage: '',
      refreshing: false,
      colorMap: {},
      restaurantName: 'Yummly\'s Kitchen',
      address:'2451 S Figueroa St., Los Angeles, CA 90007',
      tip: params.order.tip,
      tax: params.order.tax,
      rewardsRedeemed: 911,
      individualPrice: 0,
      payment: 'MASTERCARD 8798',
      myOrders: [{id:1, quantity:1, name:'Boujee Bun', price: 9999},
       {id:2, quantity: 1, name:'Kanyam West', price:42000},
       {id:3, quantity: 1, name:'Uni Ribeye Prime Steak', price:1},
       ]
    };
  }

  async componentDidMount() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${baseURL}/party/${this.props.navigation.state.params.order.partyId}`);

      const myOrders = 
        response.data.orders.filter(order => order.buyers.map(buyer => buyer.userId).includes(userId));

      const individualPrice = myOrders.reduce((total, order) => ( total + order.price/order.buyers.length), 0);

      var colorMap = {};
      response.data.members.forEach((member) => {
          colorMap[member.userId] = colors[colorIndex % 5];
          colorIndex ++; 
      });
      
      this.setState({myOrders, colorMap, individualPrice});
    } catch (err) {
      this.setState({errMessage: err.message});
    }
  }

  componentWillUnmount() {
    this.setState({colorMap: {}});
  }


  static navigationOptions = ({navigation}) => {
        return{
            headerLeft:(
              <TouchableOpacity onPress={() => navigation.goBack(null)}>
                 <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/cancelbtn.png')} />
              </TouchableOpacity>
            ),
            title: 'Order Receipt',
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

  _keyExtractor = (item) => item._id

  _renderItem = ({item}) => (
    <View style={styles.cellContainer}>
      <View style={{flexDirection:'row'}}>
        <Text style={[{fontWeight:'bold'}, styles.bigText]}>{item.quantity}    </Text>
        <Text style={styles.bigText} numberOfLines={3}>{item.name}</Text>
      </View>
      <Text style={[{marginLeft: 25, marginTop: 10},styles.smallText]}>${(item.price/100).toFixed(2)}</Text>
    </View>
  )

  _renderHeader = () => {
    if(this.state.myOrders.length == 0) {
      return null;
    }
    return  <View style={styles.headerContainer}>
              <Text style={{color: 'gray'}}>Item</Text>
              <Text style={{color: 'gray'}}>Price for you</Text>
            </View>;
  }


  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{height:screenHeight, width:screenWidth}}>
          <View>
          <Image style={styles.restaurantIcon} source={require('./img/splash_logo.png')}/>
          <Text style={[{marginLeft: 25, marginTop: 20},styles.bigText]}>{this.state.restaurantName}</Text>
          <Text style={[{marginLeft: 25, marginTop: 10},styles.smallText]}>{this.state.address}</Text>
          </View>

          <View style={{marginTop: 20, backgroundColor: 'white'}}>
              <FlatList
                style={{marginHorizontal: 25, backgroundColor: 'white'}}
                data={this.state.myOrders}
                extraData={this.state.refresh}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
                //ListHeaderComponent={this._renderHeader}
              />
          </View>

          <View style={styles.tipContainer}>
                <Text style={[{marginLeft: 25},styles.bigText]}>Payment</Text>
                <Text style={[{marginLeft: 25, marginTop: 5, marginBottom: 5},styles.smallText]}>{this.state.payment}</Text>
                <View style={styles.lineSeparator} />         
                <View style={[styles.feeContainer]}>
                  <Text style={[{marginLeft: 25},styles.smallText]}>Subtotal </Text>
                  <Text style={[{marginRight: 25},styles.smallText]}>{`$${(this.state.individualPrice/100).toFixed(2)}`}</Text>
                </View>
                <View style={styles.feeContainer}>
                  <Text style={[{marginLeft: 25},styles.smallText]}>Tax & Fees </Text>
                  <Text style={[{marginRight: 25},styles.smallText]}>{`$${(this.state.tax/100).toFixed(2)}`}</Text>
                </View>
                <View style={styles.feeContainer}>
                  <Text style={[{marginLeft: 25},styles.smallText]}>Tip </Text>
                  <Text style={[{marginRight: 25},styles.smallText]}>{`$${(this.state.tip/100).toFixed(2)}`}</Text>
                </View>
                <View style={styles.feeContainer}>
                  <Text style={[{marginLeft: 25},styles.smallText]}>Rewards Redeemed </Text>
                  <Text style={[{marginRight: 25},styles.smallText]}>-{`$${(this.state.rewardsRedeemed/100).toFixed(2)}`}</Text>
                </View>
                <View style={styles.lineSeparator} />
                <View style={[styles.feeContainer,{marginTop: 3, marginBottom: 40}]}>
                  <Text style={[{marginLeft: 25},styles.bigText]}>Total </Text>
                  <Text style={[{marginRight: 25},styles.bigText]}>
                    {`$${((this.state.individualPrice + this.state.tip + this.state.tax)/100).toFixed(2)}`}
                  </Text>
                </View>
          </View>
          
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    flexDirection: 'column'
  },
  cellContainer : {
    marginTop: 15,
    height: 65,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerContainer: {
    flexDirection:'row',
    justifyContent: 'space-between'
  },
   tipContainer: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  feeContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lineSeparator: {
     width: '93%', 
     borderBottomColor: 'lightgray', 
     alignSelf: 'center',
     borderBottomWidth: 1, 
     paddingHorizontal: 15,
     marginVertical: 15
  },
  smallText: {
    color: darkGray,
    fontSize: 14,
  },
  bigText: {
    fontSize: 15,
  },
  restaurantIcon: {
      marginTop: 20,
      height: 80,
      width: 80,
      borderRadius: 10,
      alignSelf: 'center',
      borderColor: darkGray,
      borderWidth: 1,
  },
});