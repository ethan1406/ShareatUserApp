
'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, 
  Image, ScrollView, FlatList} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


type Props = {};

export default class OrderBuyerScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      errMessage: '',
      refreshing: false,
      colorMap: {},
      refresh: false,
      myOrders: []

    };
  }

  async componentDidMount() {

  }

  static navigationOptions = ({navigation}) => {
    return {
      headerLeft:( 
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Image style={{height: 25, width: 25, marginLeft: 20}} source={require('./img/cancelbtn.png')} />
        </TouchableOpacity>
      ),
      //title: navigation.state.params.name,
      headerStyle: {
          borderBottomWidth: 0,
          elevation: 0,
          backgroundColor: 'white'
      }
    };
  }

  _keyExtractor = (item) => item._id

  _renderItem = ({item}) => (
    <View style={styles.cellContainer}>
      <View style={[styles.bubble, {backgroundColor: this.props.navigation.state.params.colorMap[item.amazonUserSub]}]}>
          <Text style={{color: 'white'}}>{item.firstName[0]}{item.lastName[0]}</Text>
      </View>
      <Text style={{marginHorizontal: 15}}>{item.firstName} {item.lastName}</Text>
      {item.finished ? 
        ( <FontAwesome
            name={'check-circle'}
            size={15}
            style={{color: 'green', position: 'absolute', left: 17, top: 12}}
          />) : null}
    </View>
  )


  render() {
    return (
      <ScrollView contentContainerStyle={styles.container} resizeMode='contain'>
          <Text style={{marginHorizontal: 20, fontWeight: 'bold', marginTop: 15}}>
            {this.props.navigation.state.params.name}</Text>
          <Text style={{marginHorizontal: 20, color: 'gray', marginTop: 5, marginBottom: 40}}>Shared between </Text>
        <FlatList
              style={{marginHorizontal: 20, backgroundColor: 'white'}}
              data={this.props.navigation.state.params.buyers}
              extraData={this.state.refresh}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
         /> 
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex:1, 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    flexDirection: 'column'
  },
  headerContainer: {
    flexDirection:'row',
    justifyContent: 'space-between'
  },
  cellContainer: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 5,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  bubble: {
    backgroundColor: '#F3A545',
    marginHorizontal: 2,
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRadius: 20,
  }
});