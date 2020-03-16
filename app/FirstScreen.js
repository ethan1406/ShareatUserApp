'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, StatusBar} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import AsyncStorage from '@react-native-community/async-storage';
import {primaryColor, secondaryColor, darkGray} from './Colors';

import { Auth } from 'aws-amplify';

type Props = {};
export default class FirstScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      isUserLoaded: false
    };
  }

  static navigationOptions = ({navigation}) => { 
    return {  headerTransparent: true};
  }

  async componentDidMount() {
      try {
        const user = await Auth.currentAuthenticatedUser();

        this.props.navigation.navigate('QR');

        await AsyncStorage.setItem('email', user.attributes.email);
        await AsyncStorage.setItem('amazonUserSub', user.attributes.sub);
        await AsyncStorage.setItem('firstName', user.attributes.given_name);
        await AsyncStorage.setItem('lastName', user.attributes.family_name);
      }catch(err) {
        console.log(err);
      }
      this.setState({isUserLoaded: true});
  }

  
  render() {
    const {isUserLoaded} = this.state;

    if (!isUserLoaded) {
      return <View/>;
    } else {
      return (
       <ImageBackground source={require('./img/cover_photo_3.jpg')} resizeMode='cover' 
          style={styles.container}>
          <StatusBar barStyle={'dark-content'} translucent={false}/>
          <View />
          <Image style={styles.coverImage} source={require('./img/splash_logo.png')}/>
          <View />
          <View style={{width: '100%'}} >
              <TouchableOpacity style={styles.signupBtn} onPress={()=> this.props.navigation.navigate('Signup')} color='#000000'>
                  <Text style={styles.btnText}>Create an Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.signupBtn, {backgroundColor:'#FBFBFB'}]} 
                 color='#000000' onPress={()=> this.props.navigation.navigate('Login')}>
                  <Text style={[styles.btnText, {color: darkGray}]}>Log in</Text>
              </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  signupBtn: {
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    height: 45,
    backgroundColor: primaryColor,
    borderRadius: 40,
    alignSelf: 'center',
    alignItems: 'center',
    marginRight:20,
    marginLeft:20,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    elevation: 2 // Android
  },
  btnText: {
    color:'white',
    fontSize: 16,
    textAlign:'center',
    paddingTop: 11
  },
  coverImage: {
    height: 80,
    resizeMode: 'contain'
  }
});
