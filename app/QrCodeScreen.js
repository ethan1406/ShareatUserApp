
'use strict';

import React, {Component} from 'react';
import {Text, Dimensions} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {primaryColor} from './Colors';
import AsyncStorage from '@react-native-community/async-storage';
import { Auth, Analytics } from 'aws-amplify';

import axios from 'axios';

type Props = {};

const screenHeight = Dimensions.get('window').height;
class QrCodeScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = { 
      message: 'Scan Shareat QR Code',
      messageColor: 'white'
    };
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerShown: false
    };
  }

  async componentDidMount() {
    const session = await Auth.currentSession();
    const jwt = session.getAccessToken().getJwtToken();

    console.log(jwt);

    Analytics.record({
      name: 'pageView',
      attributes: {page: 'qr'}
    });

    const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
    const firstName = await AsyncStorage.getItem('firstName');
        const lastName = await AsyncStorage.getItem('lastName');

const userInfo = {amazonUserSub, firstName, lastName};

    axios.post('https://api.shareatpay.com/party/i7EpAReT/1', {amazonUserSub}).then((response) => {
      this.props.navigation.navigate('Check', {
         data: response.data.orders, 
          restaurantName: response.data.restaurant_name,
          guestCount: response.data.guest_count,
          totals: response.data.totals,
          ticketId: response.data.omnivore_ticket_id,
          members: response.data.members,
          partyId: response.data._id,
          restaurantOmnivoreId: response.data.restaurant_omnivore_id,
          restaurantAmazonUserSub: response.data.restaurantAmazonUserSub,
          userInfo: userInfo
      });
    }).catch((err) => {
      console.log(err);
    });
  
  }

  waitAndreactivate() {
    Analytics.record({
      name: 'action',
      attributes: {page: 'qr', actionType: 'scanFailure'}
    });

     setTimeout(() => {
        this.scanner.reactivate();
        this.setState({message: 'Scan Shareat QR Code', messageColor: 'white'});
     }, 2000);
  }

  async onSuccess(e) {
    const results = e.data.match('https://api.shareatpay.com/party/');
    if (results == null) {
      this.waitAndreactivate();
      this.setState({message: 'This is not a valid Shareat QR Code', messageColor: 'red'});
    } else {
      try {
        const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
        const firstName = await AsyncStorage.getItem('firstName');
        const lastName = await AsyncStorage.getItem('lastName');

        const userInfo = {amazonUserSub, firstName, lastName};

        const response =  await axios.post(e.data, {amazonUserSub});

        Analytics.record({
          name: 'action',
          attributes: {page: 'qr', actionType: 'scanSuccess'}
        });

        this.props.navigation.navigate('Check', {
          data: response.data.orders, 
          restaurantName: response.data.restaurant_name,
          guestCount: response.data.guest_count,
          totals: response.data.totals,
          ticketId: response.data.omnivore_ticket_id,
          members: response.data.members,
          partyId: response.data._id,
          restaurantOmnivoreId: response.data.restaurant_omnivore_id,
          restaurantAmazonUserSub: response.data.restaurantAmazonUserSub,
          userInfo: userInfo
        });

      } catch (err) {
        console.log(err);
        this.waitAndreactivate();
        this.setState({message: 'There is no check for this table at the moment', messageColor: 'red'});
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
            bottomViewStyle={{height: 0, flex: 0, marginBottom: '-80%'}}
            showMarker={true}
            markerStyle={{borderColor: primaryColor, borderRadius: 20, marginBottom: '20%'}}
            cameraProps={{captureAudio: false}}
            cameraStyle={{alignSelf:'center', height: screenHeight}}
            containerStyle={{alignItems:'space-between'}}
            bottomContent={<Text style={{color: this.state.messageColor, fontSize: 16}}> {this.state.message} </Text>}
          />
        );
  }
}


export default QrCodeScreen;
