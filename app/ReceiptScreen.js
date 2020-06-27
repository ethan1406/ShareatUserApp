
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, 
  Image, FlatList} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import {baseURL} from './Constants';
import {primaryColor, secondaryColor, darkGray, gray} from './Colors';
import {headerFontSize} from './Dimensions';
import { Analytics } from 'aws-amplify';


type Props = {};
export default class ReceiptScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      errMessage: '',
      refreshing: false,
      myOrders: []
    };
  }

  async componentDidMount() {
    try {
      Analytics.record({
        name: 'pageView',
        attributes: {page: 'receipt'}
      });

      const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');

      const { data } = await axios.get(`${baseURL}/party/getParty/${this.props.navigation.state.params.order.partyId}`);

          
      const myOrders = 
        data.orders.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(amazonUserSub));

      console.log(myOrders);

      this.setState({myOrders});
    } catch (err) {
      console.log(err);
      this.setState({errMessage: err.message});
    }
  }

  static navigationOptions = ({navigation}) => {
        return{
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack(null)}>
                 <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
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
        <Text style={styles.bigText} numberOfLines={3}>{item.name}</Text>
      </View>
      <Text style={[{marginTop: 10},styles.smallText]}>${(item.price/100).toFixed(2)}</Text>
    </View>
  )

  render() {
  
    const { order } = this.props.navigation.state.params;

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Image style={styles.restaurantIcon} source={{uri: order.imageUrl}}/>
          <View style={styles.headerTextContainer}>
            <Text style={[{marginLeft: 25, marginTop: 20},styles.bigText]}> { order.restaurantName } </Text>
            <Text style={[{marginLeft: 25, marginTop: 10,},styles.smallText]}> { order.address } </Text>
          </View>
        </View>
        <FlatList
          style={{margin: 25, width:'90%'}}
          data={this.state.myOrders}
          extraData={this.state.refresh}
          keyExtractor={this._keyExtractor}
          bounces={false}
          renderItem={this._renderItem}
        />
        <View style={styles.tipContainer}>
            <View style={[styles.feeContainer, {width: '95%'}]}>
              <Text style={[{marginLeft: 25},styles.bigText]}>Payment</Text>
              <Text style={[{marginLeft: 25, marginTop: 5, marginBottom: 5},styles.smallText]}>{`${order.paymentMethod.type.toUpperCase()} ${order.paymentMethod.last4Digits}`}</Text>
            </View>
            <View style={styles.lineSeparator} />         
            <View style={[styles.feeContainer]}>
              <Text style={[{marginLeft: 25},styles.smallText]}>Subtotal </Text>
              <Text style={[{marginRight: 25},styles.smallText]}>{`$${(order.totals.subTotal/100).toFixed(2)}`}</Text>
            </View>
            <View style={styles.feeContainer}>
              <Text style={[{marginLeft: 25},styles.smallText]}>Tax & Fees </Text>
              <Text style={[{marginRight: 25},styles.smallText]}>{`$${(order.totals.tax/100).toFixed(2)}`}</Text>
            </View>
            <View style={styles.feeContainer}>
              <Text style={[{marginLeft: 25},styles.smallText]}>Tip </Text>
              <Text style={[{marginRight: 25},styles.smallText]}>{`$${(order.totals.tip/100).toFixed(2)}`}</Text>
            </View>
            <View style={styles.lineSeparator} />
            <View style={[styles.feeContainer,{marginTop: 3, marginBottom: 40}]}>
              <Text style={[{marginLeft: 25},styles.bigText]}>Total </Text>
              <Text style={[{marginRight: 25},styles.bigText]}>
                {`$${((order.totals.subTotal + order.totals.tip + order.totals.tax)/100).toFixed(2)}`}
              </Text>
            </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    flexDirection: 'column'
  },
  headerContainer: {
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    flexDirection: 'row',
    width: '80%'
  },
  headerTextContainer: {
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    flexDirection: 'column',
    width: '80%'
  },
  cellContainer : {
    marginTop: 15,
    height: 65,
    borderBottomWidth: 1,
    borderColor: gray,
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
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lineSeparator: {
     width: '93%', 
     borderBottomColor: 'lightgray', 
     alignSelf: 'center',
     borderBottomWidth: 1, 
     paddingHorizontal: 15,
     marginVertical: 10
  },
  smallText: {
    color: darkGray,
    fontSize: 13,
  },
  bigText: {
    fontSize: 15,
  },
  restaurantIcon: {
      marginTop: 15,
      height: 60,
      width: 60,
      borderRadius: 10,
      alignSelf: 'center',
      borderColor: darkGray,
      borderWidth: 1,
  },
});