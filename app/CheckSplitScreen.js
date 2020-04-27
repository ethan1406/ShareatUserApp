'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions,
   Image, ScrollView, StatusBar} from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Pusher from 'pusher-js/react-native';
import OrderListItem from './components/OrderListItem';
import {primaryColor, secondaryColor, darkGray, pink, red, lightPink, purple, blue, turquoise, green} from './Colors';
import {headerFontSize} from './Dimensions';
import { pusherId } from './Constants';


type Props = {};
const colors = [turquoise, blue, pink, green, red, purple, lightPink];
const screenHeight = Dimensions.get('window').height;
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

    this.state = {
      loading: false,
      data: params.data,
      isGroupCheck: isGroupCheck,
      hasPaid: hasPaid,
      restaurantName: params.restaurantName,
      restaurantOmnivoreId: params.restaurantOmnivoreId,
      restaurantAmazonSub: params.restaurantAmazonSub,
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
      this.setState({isGroupCheck: true, colorMap: colorMap, refresh: !this.state.refresh});
    });
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
    this.setState({
      ...this.state,
      selectedIndex: index,
    });
  }

  _renderItem = ({item}) => (
    <OrderListItem
      id={item._id}
      title={item.name}
      price={this.state.selectedIndex? item.price/item.buyers.length : item.price}
      buyers={item.buyers}
      partyId={this.state.partyId}
      colorMap={this.state.colorMap}
      confirmation={!this.state.isGroupCheck}
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


  _getindividualTotal = () => {
    const individualOrders = this.state.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(this.state.userInfo.amazonUserSub));
    const individualPrice = individualOrders.reduce((total, order) => ( total + order.price/order.buyers.length), 0);
    return (individualPrice/100).toFixed(2);
  }

  render() {

    const { isGroupCheck, hasPaid, selectedIndex} = this.state;
    let instructionMessage = <View />;
    let totalTitle = selectedIndex ? 'Your Total: ' : 'Group Total: ';

    if (!isGroupCheck) {
      totalTitle = 'Your Total: ';
    }

    if (hasPaid) {
      instructionMessage = <Text style={{color: 'gray'}}>You have already completed your payment.</Text>;
    } else if (isGroupCheck) {
      instructionMessage = <Text style={{color: 'gray'}}>Double Tap the Dishes You've Shared!</Text>;
    } 


    return (
      <View style={styles.container} resizeMode='contain'>
        <StatusBar
          backgroundColor= {secondaryColor}
          barStyle="dark-content"
        />
        <View style={{flex: 1, justifyContent: 'flex-start', flexDirection: 'column', height:screenHeight, width:screenWidth}}>
          <Text style={styles.restaurantText}>{this.state.restaurantName}</Text>
          { isGroupCheck ? <SegmentedControlTab
            values={['Group Orders', 'My Orders']}
            tabStyle={styles.tabStyle}
            tabsContainerStyle={{width: screenWidth}}
            activeTabStyle={styles.activeTabStyle}
            tabTextStyle={styles.tabTextStyle}
            selectedIndex={this.state.selectedIndex}
            onTabPress={this._handleIndexChange}
          /> : <View /> }
          <View style={{marginTop: 20, backgroundColor: 'white'}}>
            <FlatList
              style={{marginHorizontal: 20, backgroundColor: 'white'}}
              data={this.state.selectedIndex ? 
                this.state.data.filter(order => order.buyers.map(buyer => buyer.amazonUserSub).includes(this.state.userInfo.amazonUserSub)) : 
                this.state.data}
              extraData={this.state.refresh}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
              ListHeaderComponent={this._renderHeader}
            />
          </View>
          <View style={styles.orderTotalContainer}>
            <Text style={{color: 'gray'}}>{totalTitle}</Text>
            <Text> {this.state.selectedIndex ? `$${this._getindividualTotal()}`: `$${(this.state.totals.sub_total/100).toFixed(2)}`} </Text>
          </View>
        </View>
        {instructionMessage}
        <TouchableOpacity style={styles.confirmBtn} onPress={()=> this.props.navigation.navigate('Confirmation', {
              data: this.state.data, 
              isGroupCheck: this.state.isGroupCheck,
              restaurantName: this.state.restaurantName,
              restaurantAmazonSub: this.state.restaurantAmazonSub,
              restaurantOmnivoreId: this.state.restaurantOmnivoreId,
              totals: this.state.totals,
              ticketId: this.state.ticketId,
              partyId: this.state.partyId,
              colorMap: this.state.colorMap,
              userInfo: this.state.userInfo
            })} color='#000000'>
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
    backgroundColor: '#ffa91f'
  },
  tabStyle: {
    borderColor:'#F3A545',
    height: 35,
    borderWidth: 0
  },
  tabTextStyle: {
    color: '#F3A545'
  },
  restaurantText: {
    alignSelf: 'flex-start',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    marginLeft: 20,
    color: darkGray
  },
  confirmBtn: {
    width: '100%',
    height: 40,
    backgroundColor: primaryColor,
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