
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, 
  FlatList, Image, ScrollView, Dimensions} from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import axios from 'axios';
import Dialog from 'react-native-dialog';
import {HeaderBackButton} from 'react-navigation';
import {baseURL} from './Constants';
import Card from './models/Card';
import AsyncStorage from '@react-native-community/async-storage';
import OrderListItem from './components/OrderListItem';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';


type Props = {};
const screenHeight = Dimensions.get('window').height;
const screenWidth= Dimensions.get('window').width;
const taxRate = 0.095;

export default class ConfirmationScreen extends Component<Props> {

  constructor(props) {
    super(props);

    var params = this.props.navigation.state.params;
    var myOrders = params.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(params.amazonUserSub));

    var individualPrice = myOrders.reduce((total, order) => ( total + order.price/order.buyers.length), 0);
    var tax = individualPrice * taxRate;
    var tip = (tax + individualPrice) * 0.12;
    var individualTotal = parseInt(individualPrice + tax + tip, 10);

    this.state = {
      data: myOrders,
      colorMap: params.colorMap,
      restaurantName: params.restaurantName,
      restaurantId: params.restaurantId,
      individualPrice: individualPrice,
      individualTotal: individualTotal,
      tax: tax,
      tip: tip,
      customTipString: '',
      customTip: 0,
      tipRate: 0,
      selectedIndex: 0,
      partyId: params.partyId,
      refresh: false,
      dialogVisible: false,
      selectedCard: {_id:'', last4Digits: 0, selected:false, type:''}
    };
  }


  static navigationOptions = ({navigation}) => {
    return{
      headerLeft:( 
          <TouchableOpacity onPress={() => navigation.goBack(null)}>
             <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
          </TouchableOpacity>
      ),
      headerRight: (
        <View />
      ),
      title: 'Confirmation',
      headerStyle: {
        backgroundColor: secondaryColor,
      },
      headerTintColor: darkGray,
      headerTitleStyle: {
        marginTop:5,
        fontSize: headerFontSize, 
        textAlign:'center', 
        flex:1 ,
      } 
    };
  }

  async componentDidMount() {
    this._fetchCards();
  }

  willFocus = this.props.navigation.addListener(
    'willFocus',
    async payload => {
      this._fetchCards();
    }
  );

  _fetchCards = async () => {
    try {
        const amazonUserSub = await AsyncStorage.getItem('amazonUserSub');
        const {data} = await axios.get(`${baseURL}/user/${amazonUserSub}/getCards`);
        var selectedCard;
        data.cards.forEach(card => {
          if(card.selected) {
            selectedCard = {_id: card._id, last4Digits: card.last4Digits, selected: card.selected,
            type: card.type};
          }
        });
        this.setState({selectedCard});
      } catch (err) {
        this.setState({errorMessage: err.response.data.error});
      }
  }

  _getCardImage = (type, tintColor) => {
    const brandLower = type.toLowerCase();
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

  onSelect = data => {
    this.setState(data);
  }

  _renderItem = ({item}) => (
    <OrderListItem
      id={item._id}
      title={item.name}
      price={item.price/item.buyers.length}
      buyers={item.buyers}
      partyId={this.state.partyId}
      colorMap={this.state.colorMap}
      confirmation={true}
      navigation={this.props.navigation}
    />
  )

  _renderHeader = () => {
    return  <View style={styles.headerContainer}>
              <Text style={{color: 'gray'}}>Item</Text>
              <Text style={{color: 'gray'}}>Price for you</Text>
            </View>;
  }

  _keyExtractor = (item) => item._id

  _handleIndexChange = (index) => {
    var tipRate = 0.12;
    if (index == 0){
      tipRate = 0.12;
    } else if (index == 1) {
      tipRate = 0.15;
    } else if (index == 2) {
      tipRate = 0.18;
    } else if (index == 3) {
      this.setState({...this.state,
        selectedIndex: index, 
        dialogVisible: true});
      return;
    }
    var tip = (this.state.individualPrice + this.state.tax) * tipRate;
    var individualTotal = parseInt(tip + this.state.individualPrice + this.state.tax, 10);
    
    this.setState({
      ...this.state,
      selectedIndex: index,
      individualTotal,
      tip
    });
  }

  _handleCustomTip = (customTipString) => {
    var numOfPeriod = 0;
    for(const char of customTipString) {
      if(char == '.') {
        numOfPeriod++;
      }
    }
    if(numOfPeriod > 1) {
      customTipString = customTipString.slice(0, -1);
    }

    this.setState({customTip: parseFloat(customTipString)*100, customTipString});
  }

  _enterCustomTip = () => {
    var individualTotal = parseInt(this.state.customTip + this.state.individualPrice + this.state.tax, 10);

    this.setState({
      ...this.state,
      individualTotal,
      tip: this.state.customTip,
      dialogVisible: false
    });
  }

  _confirmAndPay = async () => {
    // try {
    //   await axios.post(baseURL + '/user/makePayment/', 
    //     {amount: this.state.individualTotal, 
    //      tax: this.state.tax,
    //      tip: this.state.tip,
    //      points: Math.floor(this.state.individualPrice),  
    //      restaurantId: this.state.restaurantId,
    //      partyId: this.state.partyId
    //     });
    // } catch (err) {
    //   console.log(err);
    // }

    this.props.navigation.navigate('RewardAccumulation', {
      individualPrice: this.state.individualPrice, 
      restaurantName: this.state.restaurantName,
      restaurantId: this.state.restaurantId
    });
  }


  render() {
    return (
      <View style={styles.container} resizeMode='contain'>
      <ScrollView style={{height:screenHeight, width:screenWidth}} showsVerticalScrollIndicator={false}>
        <Text style={styles.restaurantText}>{this.state.restaurantName}</Text>
          <TouchableOpacity style={styles.totalContainer} 
            onPress={()=> {this.props.navigation.navigate('PaymentMethods', {onSelect: this.onSelect.bind(this)});}} 
            color='#000000'>
              <Text style={styles.btnText}>Payment Method</Text>
              <Text style={styles.rightText}> > </Text>
          </TouchableOpacity>
          <View style={[styles.signupBtn, {backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', height: 45}]} 
            color='#000000'>
              {this._getCardImage(this.state.selectedCard.type, '#F3A545')}
              <Text>{`${this.state.selectedCard.type} Ending in ${this.state.selectedCard.last4Digits}`}</Text>
          </View>
          <View style={[styles.signupBtn]} color='#000000'>
              <Text style={[styles.btnText]}>Orders</Text>
          </View>
          <View style={{backgroundColor: 'white'}}>
            <View style={styles.flastListContainer}>
              <FlatList
                data={this.state.data}
                extraData={this.state.refresh}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
                ListHeaderComponent={this._renderHeader}
              />
            </View>
          </View>
          <View style={styles.tipContainer}>
              <View style={[styles.totalContainer]} color='#000000'>
                  <Text style={[styles.btnText]}>Total</Text>
                  <Text style={[styles.rightText]}> {`$${(this.state.individualTotal/100).toFixed(2)}`}</Text>
              </View>
              <View style={[styles.feeContainer]}>
                <Text style={{marginLeft: 15}}>Subtotal </Text>
                <Text style={{marginRight: 15}}>{`$${(this.state.individualPrice/100).toFixed(2)}`}</Text>
              </View>
              <View style={styles.feeContainer}>
                <Text style={{marginLeft: 15}}>Tax & Fees </Text>
                <Text style={{marginRight: 15}}>{`$${(this.state.tax/100).toFixed(2)}`}</Text>
              </View>
              <View style={styles.feeContainer}>
                <Text style={{marginLeft: 15}}>Tip </Text>
                <Text style={{marginRight: 15}}>{`$${(this.state.tip/100).toFixed(2)}`}</Text>
              </View>
              <View style={[styles.feeContainer, {justifyContent: 'center'}]}>
                <SegmentedControlTab
                  values={['12%', '15%', '18%', 'Custom']}
                  tabsContainerStyle={styles.tabsContainerStyle}
                  tabStyle={styles.tabStyle}
                  activeTabStyle={styles.activeTabStyle}
                  tabTextStyle={styles.tabTextStyle}
                  selectedIndex={this.state.selectedIndex}
                  onTabPress={this._handleIndexChange}
                />
              </View>
          </View>
        </ScrollView>
        <TouchableOpacity style={[styles.confirmBtn]} onPress={()=> {this._confirmAndPay();}} color='#000000'>
            <Text style={[styles.btnText, {marginLeft: 0, paddingTop: 12, color: 'white'}]}>Confirm & Pay</Text>
        </TouchableOpacity>
        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>Custom Tip</Dialog.Title>
          <Dialog.Description>
            Please enter the amount of tip you want to give.
          </Dialog.Description>
          <Dialog.Input multiline={false} keyboardType='numeric' value={this.state.customTipString}
           placeholder='Custom Tip' onChangeText={(customTipString) => this._handleCustomTip(customTipString)} />
          <Dialog.Button label="Cancel" onPress={()=> { this.setState({ dialogVisible: false });}} />
          <Dialog.Button label="Enter" onPress={()=> {this._enterCustomTip();}} />
        </Dialog.Container>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  tipContainer: {
    flex: 1,
    marginTop: 0,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',

  },
  headerContainer: {
    flexDirection:'row',
    justifyContent: 'space-between'
  },
  feeContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  totalContainer: {
    width: '100%',
    height: 30,
    backgroundColor: secondaryColor,
    borderRadius: 2,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  flastListContainer: {
    marginHorizontal: 15,
    marginVertical: 10
  },
  restaurantText: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 15,
    color: 'black'
  },
  signupBtn: {
    marginBottom: 0,
    width: '100%',
    height: 30,
    backgroundColor: secondaryColor,
    borderRadius: 2,
    alignItems: 'flex-start',
  },
  confirmBtn: {
    marginBottom: 0,
    marginTop: 20,
    width: '100%',
    height: 40,
    backgroundColor: primaryColor,
    borderRadius: 0,
    alignItems: 'center',
    marginRight:20,
    marginLeft:20
  },
  btnText: {
    color:darkGray,
    textAlign:'left',
    marginLeft: 15,
    paddingTop: 9
  },
  rightText: {
    color:'white',
    textAlign:'right',
    marginRight: 15,
    paddingTop: 7
  },
  tabsContainerStyle:{
    marginLeft: 15,
    height: 30,
    width: '85%'
  },
  activeTabStyle: {
    backgroundColor: primaryColor
  },
  tabStyle: {
    borderColor: primaryColor,
    backgroundColor: secondaryColor,
    borderWidth: 0
  },
  tabTextStyle: {
    color: '#F3A545'
  },
  textInput: {
    height: 40, 
    width: '60%',
    textAlign: 'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  }
});