
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, 
  FlatList, Image, Dimensions} from 'react-native';
import { Tooltip } from 'react-native-elements';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import axios from 'axios';
import Dialog from 'react-native-dialog';
import {baseURL} from './Constants';
import Card from './models/Card';
import OrderListItem from './components/OrderListItem';
import {primaryColor, secondaryColor, darkGray, turquoise} from './Colors';
import {headerFontSize} from './Dimensions';


type Props = {};
const screenHeight = Dimensions.get('window').height;
const screenWidth= Dimensions.get('window').width;
const defaultTipRate = 0.12;

export default class ConfirmationScreen extends Component<Props> {

  constructor(props) {
    super(props);

    var params = this.props.navigation.state.params;
    var myOrders = params.isGroupCheck ? 
      params.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(params.userInfo.amazonUserSub))
      : params.data;

    var sub_total = params.isGroupCheck ? 
      myOrders.reduce((total, order) => ( total + order.price/order.buyers.length), 0)
      : params.totals.sub_total + params.totals.other_charges + params.totals.service_charges - params.totals.discounts;

    var tax = params.isGroupCheck ? 
      Math.floor((sub_total/params.totals.sub_total) * params.totals.tax)
      : params.totals.tax;

    var tip = Math.floor(sub_total * defaultTipRate);

    var total = params.isGroupCheck ?
      parseInt(sub_total + tax + tip, 10)
      : params.totals.total + tip;


    this.state = {
      data: myOrders,
      colorMap: params.colorMap,
      restaurantName: params.restaurantName,
      userInfo: params.userInfo,
      ticketId: params.ticketId,
      restaurantAmazonUserSub: params.restaurantAmazonUserSub,
      restaurantOmnivoreId: params.restaurantOmnivoreId,
      total: total,
      sub_total: sub_total,
      tax: tax,
      tip: tip,
      customTipString: '',
      customTip: 0,
      tipRate: 0,
      selectedIndex: 0,
      partyId: params.partyId,
      refresh: false,
      remainingBalance: 0, 
      dialogVisible: false,
      selectedCard: {_id:'', last4Digits: 0, selected:false, type:''}
    };
  }


  static navigationOptions = ({navigation}) => {
    return{
      headerLeft: () =>
          <TouchableOpacity onPress={() => navigation.goBack(null)}>
             <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
          </TouchableOpacity>
      ,
      title: 'Confirmation',
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

  async componentDidMount() {
    this._fetchCards();
    if (this.props.navigation.state.params.shouldPayRemainder) {
      try {
         const {data} = await axios.post(baseURL + '/party/remainder', 
                              {ticketId: this.state.ticketId,
                               restaurantOmnivoreId: this.state.restaurantOmnivoreId,
                            });
         const remainingBalance = data.due - this.state.total;
         this.setState({remainingBalance});

      } catch (err) {
        console.log(err);
      }
    }
  }

  willFocus = this.props.navigation.addListener(
    'willFocus',
    async payload => {
      this._fetchCards();
    }
  );

  _fetchCards = async () => {
    try {
        const {data} = await axios.get(`${baseURL}/user/${this.state.userInfo.amazonUserSub}/getCards`);
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
      price={item.buyers.length == 0 ? item.price : item.price/item.buyers.length}
      buyers={item.buyers}
      partyId={this.state.partyId}
      colorMap={this.state.colorMap}
      confirmation={true}
      userInfo={this.state.userInfo}
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
    var tip = Math.floor((this.state.sub_total) * tipRate);
    var total = parseInt(tip + this.state.sub_total + this.state.tax + this.state.remainingBalance, 10);
    
    this.setState({
      ...this.state,
      selectedIndex: index,
      total,
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
    var total = parseInt(this.state.customTip + this.state.sub_total + this.state.tax, 10);

    this.setState({
      ...this.state,
      total,
      tip: this.state.customTip,
      dialogVisible: false
    });
  }

  _confirmAndPay = async () => {
    try {

      await axios.post(baseURL + `/user/${this.state.userInfo.amazonUserSub}/makePayment/`, 
        {subTotal: this.state.sub_total,
         tax: this.state.tax, 
         tip: this.state.tip,
         ticketId: this.state.ticketId,
         points: Math.floor(this.state.sub_total),  
         restaurantOmnivoreId: this.state.restaurantOmnivoreId,
         restaurantAmazonUserSub: this.state.restaurantAmazonUserSub,
         partyId: this.state.partyId
      });

      this.props.navigation.navigate('RewardAccumulation', {
        sub_total: this.state.sub_total, 
        restaurantName: this.state.restaurantName,
        restaurantOmnivoreId: this.state.restaurantOmnivoreId,
        userInfo: this.state.userInfo,
        restaurantAmazonUserSub: this.state.restaurantAmazonUserSub
      });
    } catch (err) {
      console.log(err);
      if (err.response.status == 503) {
        // agent offline, ask waiter
      } else if (err.response.status == 400) {
       // card has been charged, ask waiter
      } else if (err.response.status == 500) {
        // please try again
      }
    }
    
  }


  render() {
    
    const {shouldPayRemainder} = this.props.navigation.state.params;

    return (
      <View style={styles.container} resizeMode='contain'>
      <View style={{flex: 1, justifyContent: 'flex-start', flexDirection: 'column', height:screenHeight, width:screenWidth}}>
        <Text style={styles.restaurantText}>{this.state.restaurantName}</Text>
          <TouchableOpacity style={styles.totalContainer} 
            onPress={()=> {this.props.navigation.navigate('PaymentMethods', {onSelect: this.onSelect.bind(this)});}} 
            color='#000000'>
              <Text style={styles.btnText}>Payment Method</Text>
              <Text style={[styles.rightText, {fontSize: 20, paddingTop: -3}]}> > </Text>
          </TouchableOpacity>
          <View style={[styles.signupBtn, {backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', height: 45}]} 
            color='#000000'>
              {this._getCardImage(this.state.selectedCard.type, primaryColor)}
              <Text>{`${this.state.selectedCard.type} Ending in ${this.state.selectedCard.last4Digits}`}</Text>
          </View>
          <View style={[styles.signupBtn]} color='#000000'>
              <Text style={[styles.btnText]}>Orders</Text>
          </View>
          <FlatList
            style={styles.flastListContainer}
            data={this.state.data}
            extraData={this.state.refresh}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
            bounces={false}
            ListHeaderComponent={this._renderHeader}
          />
          <View style={styles.tipContainer}>
              <View style={[styles.totalContainer]} color='#000000'>
                  <Text style={[styles.btnText]}>Total</Text>
                  <Text style={[styles.rightText]}> {`$${(this.state.total/100).toFixed(2)}`}</Text>
              </View>
              <View style={[styles.feeContainer]}>
                <Text style={{marginLeft: 15}}>Subtotal </Text>
                <Text style={{marginRight: 15}}>{`$${(this.state.sub_total/100).toFixed(2)}`}</Text>
              </View>
              <View style={styles.feeContainer}>
                <Text style={{marginLeft: 15}}>Tax </Text>
                <Text style={{marginRight: 15}}>{`$${(this.state.tax/100).toFixed(2)}`}</Text>
              </View>
              <View style={styles.feeContainer}>
                <Text style={{marginLeft: 15}}>Tip </Text>
                <Text style={{marginRight: 15}}>{`$${(this.state.tip/100).toFixed(2)}`}</Text>
              </View>
              {shouldPayRemainder ?
                <View style={[styles.feeContainer, {marginLeft: 15}]}>
                  <Tooltip backgroundColor={turquoise} containerStyle={{width:'70%'}} height={180}
                    popover={<Text>When dishes are split, we round down the number for everyone. This leads to 
                      a small difference between the dish and what is paid. Our algorithm requires the last person
                      to cover these small accumulated differences. </Text>}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text>Remaining differences</Text>
                        <Image style={{height: 20, width: 20, marginLeft: 5, tintColor: primaryColor}} source={require('./img/ic_moreInfo.png')} />
                      </View>
                  </Tooltip>
                  <Text style={{marginRight: 30}}>{`$${(this.state.remainingBalance/100).toFixed(2)}`}</Text>
                </View> : null
              }
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
        </View>
        <TouchableOpacity style={[styles.confirmBtn]} onPress={()=> {this._confirmAndPay();}} color='#000000'>
            <Text style={[styles.btnText, {marginLeft: 0, paddingTop: 9, color: 'white'}]}>Confirm & Pay</Text>
        </TouchableOpacity>
        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>Custom Tip</Dialog.Title>
          <Dialog.Description>
            Please enter the amount of tip you want to give.
          </Dialog.Description>
          <Dialog.Input multiline={false} style={{color: darkGray}} keyboardType='numeric' value={this.state.customTipString}
           placeholder='Custom Tip' placeholderTextColor={darkGray} onChangeText={(customTipString) => this._handleCustomTip(customTipString)} />
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
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  tipContainer: {
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
    fontSize: 24,
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 15,
    color: darkGray
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
    color: darkGray,
    textAlign:'left',
    marginLeft: 15,
    fontSize: 17,
    paddingTop: 3
  },
  rightText: {
    color: primaryColor,
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