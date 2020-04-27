
'use strict';

import React, {Component} from 'react';
import {Text, StatusBar} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {primaryColor} from './Colors';
import AsyncStorage from '@react-native-community/async-storage';

import axios from 'axios';

type Props = {};
class QrCodeScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = { 
     };
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerShown: false,
    };
  }

  componentDidMount() {
    // axios.get('https://www.shareatpay.com/party/5b346f48d585fb0e7d3ed3fc/6').then((response) => {
    //   this.props.navigation.navigate('Check', {
    //     data: response.data.orders, 
    //     restaurantName: response.data.restaurantName,
    //     orderTotal: response.data.orderTotal,
    //     members: response.data.members,
    //     partyId: response.data._id,
    //     restaurantId: response.data.restaurantId
    //   });
    // }).catch((err) => {
    //   console.log(err);
    // });
  
  }

  waitAndreactivate() {
     setTimeout(() => {
        this.scanner.reactivate();
     }, 1000);
  }

  async onSuccess(e) {
    const results = e.data.match('https://www.shareatpay.com/party/');
    if (results == null) {
      this.waitAndreactivate();
    } else {
      try {
        const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
        const firstName = await AsyncStorage.getItem('firstName');
        const lastName = await AsyncStorage.getItem('lastName');

        const userInfo = {amazonUserSub, firstName, lastName};


        const response =  await axios.post(e.data, {amazonUserSub});

        this.props.navigation.navigate('Check', {
          data: response.data.orders, 
          restaurantName: response.data.restaurant_name,
          guestCount: response.data.guest_count,
          totals: response.data.totals,
          ticketId: response.data.omnivore_ticket_id,
          members: response.data.members,
          partyId: response.data._id,
          restaurantOmnivoreId: response.data.restaurant_omnivore_id,
          restaurantAmazonSub: response.data.restaurantAmazonSub,
          userInfo: userInfo
        });

      } catch (err) {
        console.log(err);
        this.waitAndreactivate();
      }
    }

  }

  willFocus = this.props.navigation.addListener(
    'willFocus',
    payload => {
        if (this.scanner !== null) {
          this.scanner.reactivate();
        }
    }
  );

  render() {
    return (
          <QRCodeScanner
            ref={(node) => { this.scanner = node; }}
            onRead={this.onSuccess.bind(this)}
            topViewStyle={{height: 0, flex: 0}}
            bottomViewStyle={{height: 0, flex: 0, marginBottom: '-90%'}}
            showMarker={true}
            markerStyle={{borderColor: primaryColor, borderRadius: 20, marginBottom: '20%'}}
            cameraProps={{captureAudio: false}}
            cameraStyle={{alignSelf:'center', height: '200%'}}
            containerStyle={{alignItems:'space-between'}}
            bottomContent={<Text style={{color: 'white', fontSize: 16}}> Scan Shareat QR Code </Text>}
          />
        );
  }
}


export default QrCodeScreen;
