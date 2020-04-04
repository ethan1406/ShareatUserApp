
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, StatusBar} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {primaryColor, secondaryColor} from './Colors';

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

  onSuccess(e) {
    //e.data
    axios.get(e.data).then((response) => {
      this.props.navigation.navigate('Check', {
        data: response.data.orders, 
        restaurantName: response.data.restaurantName,
        orderTotal: response.data.orderTotal,
        members: response.data.members,
        partyId: response.data._id,
        restaurantId: response.data.restaurantId
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  willFocus = this.props.navigation.addListener(
    'willFocus',
    payload => {
        this.scanner.reactivate();
    }
  );

  render() {
    return (
          <QRCodeScanner
            ref={(node) => { this.scanner = node; }}
            onRead={this.onSuccess.bind(this)}
            topViewStyle={{height: 0, flex: 0}}
            bottomViewStyle={{height: 0, flex: 0}}
            showMarker={true}
            markerStyle={{borderColor: primaryColor, borderRadius: 20}}
            cameraProps={{captureAudio: false}}
            cameraStyle={{alignSelf:'center', height: '200%'}}
            containerStyle={{backgroundColor: ''}}
            bottomContent={<Text style={{color: 'white', paddingBottom: '85%', fontSize: 16}} > Scan Shareat QR Code </Text>}
          />
        );
  }
}


export default QrCodeScreen;

const styles = StyleSheet.create({
});