
'use strict';

import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Image, ScrollView, StyleSheet, StatusBar} from 'react-native';
import {baseURL} from './Constants';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {primaryColor, secondaryColor, darkGray, turquoise, gray} from './Colors';
import {headerFontSize} from './Dimensions';
type Props = {};


export default class PaymentMethodsScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = { 
      cards: [],
      errorMessage: '',
      shouldRefresh: false
    };
  }

  async componentDidMount() {
    this._fetchCards();
  }

  _fetchCards = async () => {
    try {
      const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');

      const {data} = await axios.get(`${baseURL}/user/${amazonUserSub}/getCards`);
      this.setState({cards: data.cards, shouldRefresh: true});
    } catch (err) {
      this.setState({errorMessage: err.response.data.error});
    }
  }

    static navigationOptions = ({navigation}) => {
        return{
            headerLeft:( 
              <TouchableOpacity onPress={() => navigation.goBack(null)}>
                 <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
              </TouchableOpacity>
            ),
            title: 'Payment Method',
            headerStyle: {
                backgroundColor: secondaryColor,
            },
            headerTintColor: darkGray,
            headerTitleStyle: {
                fontSize: headerFontSize
            },
            headerTitleAlign: 'center'
        };
    }


  _getCardImage = (brandName, tintColor) => {
    const brandLower = brandName.toLowerCase();
    if (brandLower === 'visa') {
      return (<Image style={{tintColor: tintColor, marginHorizontal: 15}} source={require('./img/stripe/card_visa.png')} />);
    } else if (brandLower === 'master-card') {
      return (<Image style={{tintColor: tintColor, marginHorizontal: 15}} source={require('./img/stripe/card_mastercard.png')} />);
    } else if (brandLower === 'american-express') {
      return (<Image style={{tintColor: tintColor, marginHorizontal: 15}} source={require('./img/stripe/card_amex.png')} />);
    } else if (brandLower === 'apple-pay') {
      return (<Image style={{tintColor: tintColor, marginHorizontal: 15}} source={require('./img/stripe/card_applepay.png')} />);
    } else if (brandLower === 'discover') {
      return (<Image style={{tintColor: tintColor, marginHorizontal: 15}} source={require('./img/stripe/card_discover.png')} />);
    }
    return (<View />);
  }

  _onPressItem = async (id) => {
    try {
        var {cards} = this.state;
        cards.forEach(card => {
            card.selected = card._id == id;
        });
        this.setState({cards, shouldRefresh: true});

        const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
        const {data} = await axios.post(`${baseURL}/user/${amazonUserSub}/changeDefaultPayment`, {cardId: id});
        this.setState({cards: data.cards, shouldRefresh : false});
     } catch (err) {
        this.setState({errorMessage: err.response.data.error});
     }
  }

  shouldComponentUpdate(nextProps, nextState) { 
    return nextState.shouldRefresh;
  }


  _addCard = card => {
    this.setState([...this.state.cards, card]);
  };

  willFocus = this.props.navigation.addListener(
    'willFocus',
    async payload => {
      this._fetchCards();
    }
  );

  render() {
    return (
      <ScrollView 
        contentContainerStyle={styles.container}>
        <StatusBar backgroundColor= {secondaryColor} barStyle="dark-content"/>
        <Text style={styles.message}> Please select your payment method</Text>
        {this.state.cards.map((card, index) => (
          card.selected? 
            <TouchableOpacity style={styles.cardContainer} key={index}>
              {this._getCardImage(card.type, primaryColor)}
              <Text>{`${card.type} Ending in ${card.last4Digits}`}</Text>
              <Image style={{tintColor: primaryColor, marginLeft: 20}} source={require('./img/stripe/icon_checkmark.png')} />
            </TouchableOpacity>
          : 
            <TouchableOpacity style={styles.cardContainer} key={index}
              onPress={()=>{this._onPressItem(card._id);}}>
              {this._getCardImage(card.type, darkGray)}
              <Text>{`${card.type} Ending in ${card.last4Digits}`}</Text>
            </TouchableOpacity>   
        ))}
        <TouchableOpacity style={[styles.cardContainer, {marginTop: 20, borderColor: 'white'}]} onPress={() => this.props.navigation.navigate('AddPaymentMethod', { addCard: this._addCard })}>
          <Image style={{tintColor: turquoise, marginHorizontal: 15}} source={require('./img/stripe/icon_add.png')} />
          <Text> Add New Card... </Text>
      </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    alignItems: 'center',
    height: '100%'
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: 40,
    borderColor: gray,
    borderWidth: 0.5
  },
  message: {
    marginVertical: 30,
    textAlign: 'center',
    fontSize: 15,
    color: 'black'
  },
});

