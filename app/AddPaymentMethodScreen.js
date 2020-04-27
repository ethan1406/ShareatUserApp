
'use strict';

import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {baseURL} from './Constants.js';
import axios from 'axios';
import SafeAreaView from 'react-native-safe-area-view';
import { CreditCardInput } from 'react-native-credit-card-input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import AsyncStorage from '@react-native-community/async-storage';

type Props = {};


export default class AddPaymentMethodScreen extends Component<Props> {

  state = {
    form: {},
    errorMessage: ''
  }

  _onChange = form => {
    this.setState({form});
  }

  _addCard = async () => {
    if(this.state.form.valid) {
      const number = this.state.form.values.number;
      var date = this.state.form.values.expiry.split('/');

      if (date[0][0] === '0') {
        date[0] = date[0].substr(1);
      }

      var cardInfo = 
      {
        card: {
          number: number.replace(/\s/g, ''),
          cvc2: this.state.form.values.cvc,
          exp_month: parseInt(date[0]),
          exp_year: parseInt(`20${date[1]}`)
        },
        cardType: this.state.form.values.type
      };


      try {
        const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
        const response = await axios.post(`${baseURL}/user/${amazonUserSub}/storeOmnivoreCard`, cardInfo);
        if(response.status == 500) {
          this.setState({errorMessage : 'Please try again'});
        } else if (response.status == 200) {
          this.props.navigation.goBack();
          this.props.navigation.state.params.addCard(response.data.card);
        }
      } catch(err) {
        this.setState({errorMessage : 'Please try again'});
      }
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView  bounces={false} resizeMode='contain' bounces={false}>
        <SafeAreaView contentContainerStyle={styles.container} resizeMode='contain'>
            <View style={styles.topBar}>
              <TouchableOpacity  onPress={() => this.props.navigation.goBack()}>
                  <Image style={{height: 30, width: 30, marginLeft: 10}} source={require('./img/cancelbtn.png')}/>
              </TouchableOpacity>
              <Text> Add Card </Text>
              <TouchableOpacity  onPress={() => this._addCard()}>
                  <Text> Done </Text>
              </TouchableOpacity>
            </View>
            <CreditCardInput style={{marginTop: 100}} onChange={this._onChange} requiresName={true} />
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'flex-start', 
      flexDirection: 'column',
    },
    topBar: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginTop: 15, 
      marginBottom: 20,
      marginRight: 10
    },
    errorMessage: {
      textAlign: 'center',
      fontSize: 14,
      marginTop: 40,
      color: 'red',
    }
});

