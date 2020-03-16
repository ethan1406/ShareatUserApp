
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, StatusBar} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {baseURL} from './Constants';
import { Auth } from 'aws-amplify';
import { withNavigationFocus } from 'react-navigation';

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
      headerTransparent: true,
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
      if (Platform.OS === 'ios') {
        this.scanner.reactivate();
      }
    }
  );

  render() {

    if (Platform.OS === 'android') {
      const { isFocused } = this.props;
      if (isFocused){
        return (
          <QRCodeScanner
            ref={(node) => { this.scanner = node; }}
            onRead={this.onSuccess.bind(this)}
            showMarker={true}
            markerStyle={{borderColor: '#ffa91f', borderRadius: 20}}
            cameraProps={{captureAudio: false}}
            cameraStyle={{alignSelf:'center',width: '100%', height:'100%'}}
            containerStyle={{backgroundColor: '#F0F0F0'}}
            bottomContent={<Text style={{position:'relative', color: 'white', paddingBottom: '95%', fontSize: 16}} > Scan Shareat QR Code </Text>}
          />
        );
      } else {
        return <View />;
      }
    }

    return (
          <QRCodeScanner
            ref={(node) => { this.scanner = node; }}
            onRead={this.onSuccess.bind(this)}
            showMarker={true}
            markerStyle={{borderColor: '#ffa91f', borderRadius: 20}}
            cameraProps={{captureAudio: false}}
            cameraStyle={{alignSelf:'center',width: '100%', height:'100%'}}
            containerStyle={{backgroundColor: '#F0F0F0'}}
            bottomContent={<Text style={{position:'relative', color: 'white', paddingBottom: '95%', fontSize: 16}} > Scan Shareat QR Code </Text>}
          />
        );
    
  }
}


export default Platform.OS === 'android' ? withNavigationFocus(QrCodeScreen) : QrCodeScreen;

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  logo: {
    width: 170,
    height: 40,
  }
});