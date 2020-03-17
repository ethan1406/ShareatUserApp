
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, StatusBar} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {baseURL} from './Constants';
import {primaryColor, secondaryColor, darkGray} from './Colors';

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
        this.scanner.reactivate();
    }
  );

  render() {


    return (
        <View style={styles.container}>
        <StatusBar backgroundColor={secondaryColor} barStyle={'dark-content'} />
          <QRCodeScanner
            ref={(node) => { this.scanner = node; }}
            onRead={this.onSuccess.bind(this)}
            showMarker={true}
            markerStyle={{borderColor: primaryColor, borderRadius: 20}}
            cameraProps={{captureAudio: false}}
            cameraStyle={{alignSelf:'center',width: '100%', height:'100%'}}
            containerStyle={{backgroundColor: '#F0F0F0'}}
            bottomContent={<Text style={{position:'relative', color: 'white', paddingBottom: '95%', fontSize: 16}} > Scan Shareat QR Code </Text>}
          />
        </View>
        );
  }
}


export default QrCodeScreen;

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
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