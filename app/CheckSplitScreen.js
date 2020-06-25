'use strict';

import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions,
   Image, StatusBar} from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Pusher from 'pusher-js/react-native';
import OrderListItem from './components/OrderListItem';
import {primaryColor, secondaryColor, darkGray, pink, red, lightPink, purple, blue, turquoise, green} from './Colors';
import {headerFontSize} from './Dimensions';
import { pusherId } from './Constants';
import { Analytics } from 'aws-amplify';


type Props = {};
const colors = [turquoise, blue, pink, green, red, purple, lightPink];
const screenWidth= Dimensions.get('window').width;

export default class CheckSplitScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.pusher = null;
    this.splittingChannel = null;

    var params = this.props.navigation.state.params;

    const colorMap = this._createColorMap(params.members);
    const isGroupCheck = params.members.length == 1 ? false : true;
    const hasPaid = (params.members.find(member => member.amazonUserSub === params.userInfo.amazonUserSub)).hasPaid;

    const opacityValue = isGroupCheck? 1 : 0;

    this.state = {
      loading: false,
      data: params.data,
      members: params.members,
      isGroupCheck: isGroupCheck,
      fadeAnim: new Animated.Value(opacityValue),
      hasPaid: hasPaid,
      restaurantName: params.restaurantName,
      restaurantOmnivoreId: params.restaurantOmnivoreId,
      restaurantAmazonUserSub: params.restaurantAmazonUserSub,
      ticketId: params.ticketId,
      totals: params.totals,
      error: null,
      refreshing: false,
      selectedIndex: 0,
      partyId: params.partyId,
      colorMap: colorMap,
      userInfo: params.userInfo
    };

    //set up pusher to asynchronously update who are splitting the dishes
    this.pusher = new Pusher(pusherId, {
        //authEndpoint: 'YOUR PUSHER AUTH SERVER ENDPOINT',
        cluster: 'us2',
        encrypted: true
    });

    this.splittingChannel = this.pusher.subscribe(params.partyId); // subscribe to the party channel

    this.splittingChannel.bind('splitting', (data) => {
      this.setState({data: data.orders, refresh: !this.state.refresh});
    });

    this.splittingChannel.bind('new_member', (data) => {
      const colorMap = this._createColorMap(data.members);

      const wasNotGroup = this.state.isGroupCheck;
      this.setState({isGroupCheck: true, members: data.members, colorMap: colorMap, refresh: !this.state.refresh});

      if (!wasNotGroup) {
        this.fadeIn();
      }
    });

    this.splittingChannel.bind('payment_complete', (data) => {
      this.setState({data: data.orders, members: data.members, refresh: !this.state.refresh});
    });


    this.splittingChannel.bind('orders_changed', (data) => {
      this.setState({data: data.orders, totals: data.totals, refresh: !this.state.refresh});
    });

    this.segueWayToConfirmation = this.segueWayToConfirmation.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerLeft: () =>
          <TouchableOpacity onPress={() => navigation.goBack(null)}>
             <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
          </TouchableOpacity>
      ,
      title: 'Check',
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

  componentDidMount() {
    Analytics.record({
      name: 'pageView',
      attributes: {page: 'check'}
    });
  }

  _createColorMap = (members) => {
    var colorMap = {};
    var colorIndex = 0;

    members.forEach((member) => {
        colorMap[member.amazonUserSub] = colors[colorIndex % colors.length];
        colorIndex ++; 
    });
    
    return colorMap;
  }

  _keyExtractor = (item) => item._id;

  _handleIndexChange = (index) => {
    Analytics.record({
      name: 'action',
      attributes: {page: 'check', actionType: index == 0 ? 'tapGroupOrder' : 'tapMyOrder'}
    });

    this.setState({
      ...this.state,
      selectedIndex: index,
    });
  }

  fadeIn = () => {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 1500
    }).start();
  };

  _renderItem = ({item}) => (
    <OrderListItem
      id={item._id}
      title={item.name}
      price={this.state.selectedIndex? item.price/item.buyers.length : item.price}
      buyers={item.buyers}
      partyId={this.state.partyId}
      colorMap={this.state.colorMap}
      confirmation={(!this.state.isGroupCheck) || this.state.hasPaid || (item.buyers.filter(buyer => buyer.finished)).length > 0}
      userInfo={this.state.userInfo}
      navigation={this.props.navigation}
    />
  )

  _renderHeader = () => {
    var priceTag = 'Price';
    if(this.state.selectedIndex == 1) {
      if(this.state.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(this.state.userInfo.amazonUserSub)).length == 0) {
        return null;
      } else {
        priceTag = 'Price for You';
      }
    }
    return  <View style={styles.headerContainer}>
              <Text style={{color: 'gray'}}>Item</Text>
              <Text style={{color: 'gray'}}>{priceTag}</Text>
            </View>;
  }

  segueWayToConfirmation() {

    // if all other members have paid, the last person pays the remainder
    const shouldPayRemainder = this.state.members.length > 1 
        && (this.state.members.filter(member => member.hasPaid == false)).length == 1 ;

    Analytics.record({
      name: 'action',
      attributes: {page: 'check', actionType: 'tapConfirmation'}
    });

  
    this.props.navigation.navigate('Confirmation', {
          data: this.state.data, 
          isGroupCheck: this.state.isGroupCheck,
          restaurantName: this.state.restaurantName,
          restaurantAmazonUserSub: this.state.restaurantAmazonUserSub,
          restaurantOmnivoreId: this.state.restaurantOmnivoreId,
          totals: this.state.totals,
          ticketId: this.state.ticketId,
          partyId: this.state.partyId,
          colorMap: this.state.colorMap,
          userInfo: this.state.userInfo,
          shouldPayRemainder: shouldPayRemainder,
          members: this.state.members
        });
  }


  _getindividualTotal = () => {
    const individualOrders = this.state.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(this.state.userInfo.amazonUserSub));
    const individualPrice = individualOrders.reduce((total, order) => ( total + order.price/order.buyers.length), 0);
    return (individualPrice/100).toFixed(2);
  }

  render() {

    const { isGroupCheck, hasPaid, selectedIndex} = this.state;
    let instructionMessage = '';
    let totalTitle = selectedIndex ? 'Your Total: ' : 'Group Total: ';

    if (!isGroupCheck) {
      totalTitle = 'Your Total: ';
    }

    if (hasPaid) {
      instructionMessage = 'You have already completed your payment.';
    } else if (isGroupCheck) {
      instructionMessage = 'Double Tap the Dishes You\'ve Shared!';
    } else {
      instructionMessage = 'If this is a group order, your friends can scan the code and split the check with you.';
    }

    return (
      <View style={styles.container} resizeMode='contain'>
        <StatusBar
          backgroundColor= {secondaryColor}
          barStyle="dark-content"
        />
        <View style={{flex: 1, justifyContent: 'flex-start', flexDirection: 'column'}}>
          <Text style={styles.restaurantText}>{this.state.restaurantName}</Text>
          { isGroupCheck ? <Animated.View style={{opacity: this.state.fadeAnim}}>
                 <SegmentedControlTab
                values={['Group Orders', 'My Orders']}
                tabStyle={styles.tabStyle}
                tabsContainerStyle={{width: screenWidth}}
                activeTabStyle={styles.activeTabStyle}
                tabTextStyle={styles.tabTextStyle}
                activeTabTextStyle={styles.activeTabTextStyle}
                firstTabStyle={{borderRightWidth: 0}}
                selectedIndex={this.state.selectedIndex}
                onTabPress={this._handleIndexChange}
              /> 
            </Animated.View> : <View /> }
            <FlatList
              style={{backgroundColor: 'white', marginTop: 20}}
              data={this.state.selectedIndex ? 
                this.state.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(this.state.userInfo.amazonUserSub)) : 
                this.state.data}
              extraData={this.state.refresh}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
              bounces= {false}
              ListHeaderComponent={this._renderHeader}
            />
          <View style={styles.orderTotalContainer}>
            <Text style={{color: darkGray}}>{totalTitle}</Text>
            <Text> {this.state.selectedIndex ? `$${this._getindividualTotal()}`: `$${((this.state.data.reduce( (acc, order) => acc + order.price, 0))/100).toFixed(2)}`} </Text>
          </View>
        </View>
        <Text style={{color: darkGray, width: '80%', textAlign:'center'}}>{instructionMessage}</Text>
        <TouchableOpacity style={[styles.confirmBtn, {backgroundColor: this.state.hasPaid ? darkGray : primaryColor}]} 
          disabled={this.state.hasPaid} onPress={this.segueWayToConfirmation} color='#000000'>
            <Text style={styles.btnText}>Check out</Text>
        </TouchableOpacity>
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
    backgroundColor: 'white',
  },
  orderTotalContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: 20,
    padding: 5,
    marginBottom: 50,
    backgroundColor: 'white'
  },
  headerContainer: {
    flexDirection:'row',
    justifyContent: 'space-between'
  },
  activeTabStyle: {
    backgroundColor: 'white',
    borderColor: primaryColor,
    borderBottomWidth: 2,
    borderWidth: 0
  },
  tabStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0
  },
  tabTextStyle: {
    color: darkGray
  },
  activeTabTextStyle: {
    color: primaryColor
  },
  restaurantText: {
    alignSelf: 'flex-start',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: darkGray
  },
  confirmBtn: {
    width: '100%',
    height: 40,
    borderRadius: 0,
    alignItems: 'center',
    marginRight:20,
    marginLeft:20,
    marginTop: 15,
    marginBottom: 0
  },
  btnText: {
    color:'white',
    fontSize: 17,
    textAlign:'center',
    paddingTop: 9
  }
});