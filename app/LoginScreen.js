'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, TextInput, StatusBar} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import SafeAreaView from 'react-native-safe-area-view';
import AsyncStorage from '@react-native-community/async-storage';
import {baseURL} from './Constants.js';
import axios from 'axios';
import { withOAuth } from 'aws-amplify-react-native';
import { Auth, Hub } from 'aws-amplify';

type Props = {};
class LoginScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = { 
      email: '',
      pwd: '',
      errorMessage: '',
      confirmationCode: '',
      resendCodeText: 'Resend One-Time Password',
      isConfirmationPage: false,
     };

     Hub.listen('auth', async (data) => {
        switch (data.payload.event) {
            case 'signIn':
                try {
                  const user = await Auth.currentAuthenticatedUser();
                  this._attachAuthorizationHeaderToAxios();
                  this._saveUserToDB(user.signInUserSession.idToken.payload);
                  this.props.navigation.navigate('QR');
                } catch(err) {
                  console.log(err);
                  this.setState({errorMessage: 'Please try logging in again.'});
                }
                break;
            default:
                break;
          }
      });

     this._login = this._login.bind(this);
     this._resendEmail = this._resendEmail.bind(this);
     this._verifyEmail = this._verifyEmail.bind(this);
     this._saveUserToDB = this._saveUserToDB.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerTransparent: true,
    };
  }

  async _attachAuthorizationHeaderToAxios() {
      const session = await Auth.currentSession();
      const jwt = session.getAccessToken().getJwtToken();
      const bearerToken = 'Bearer ' + jwt;
      axios.defaults.headers.common['Authorization'] = bearerToken;
  }

  async _login() {
    if(this.state.email.trim().toLowerCase() === '') {
      this.setState({errorMessage: 'Please enter your email'});
      return;
    }

    if(this.state.pwd.trim() === '') {
      this.setState({errorMessage: 'Please enter your password'});
      return;
    }

    try {
      const user = await Auth.signIn(this.state.email.trim().toLowerCase(), this.state.pwd.trim());
      this._attachAuthorizationHeaderToAxios();
      await AsyncStorage.setItem('email', user.attributes.email);
      await AsyncStorage.setItem('amazonUserSub', user.attributes.sub);
      await AsyncStorage.setItem('firstName', user.attributes.given_name);
      await AsyncStorage.setItem('lastName', user.attributes.family_name);
      this.props.navigation.navigate('QR');

    } catch(err) {
      if (err.code === 'UserNotConfirmedException') {
          await Auth.resendSignUp(this.state.email);
          this.setState({errorMessage: 'Email has not been confirmed yet', isConfirmationPage: true});
      } else if(err.code === 'NotAuthorizedException') {
        this.setState({errorMessage: 'Incorrect Password'});
      } else if(err.code === 'UserNotFoundException'){
        this.setState({errorMessage: 'Email Not Found'});
      } else {
        console.log(err);
      }
    }
  } 

  async _resendEmail() {
      this.setState({errorMessage: ''});
      try {
        await Auth.resendSignUp(this.state.email);
        this.setState({resendCodeText: 'Resend Code Again'});
      } catch(err) {
        console.log(err);
        this.setState({errorMessage: err.message});
      }
   }

 async _verifyEmail() {
    this.setState({errorMessage: ''});
    try {
      await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);
      const user = await Auth.signIn(this.state.email, this.state.pwd);
      this._saveUserToDB(user.attributes);

      this.props.navigation.navigate('QR');
    } catch(err) {
      console.log(err);
      this.setState({errorMessage: err.message});
    }
 }

  async _saveUserToDB(attributes) {
    try {
       await axios.post(baseURL + '/user/signup/', 
              {email: attributes.email, amazonUserSub: attributes.sub}
             );
       await AsyncStorage.setItem('email', attributes.email);
       await AsyncStorage.setItem('amazonUserSub', attributes.sub);
       await AsyncStorage.setItem('firstName', attributes.given_name);
       await AsyncStorage.setItem('lastName', attributes.family_name);

    } catch(err) {
      console.log(err);
      this.setState({errorMessage: 'Please try again.'});
    }
 }


  _scrollToInput (reactNode: any) {
    // Add a 'scroll' ref to your ScrollView
    this.scroll.props.scrollToFocusedInput(reactNode);
  }


  render() {

    const isConfirmationPage = this.state.isConfirmationPage;

    let display;
    let resendBtn;
    let form;
    let submitBtn;

    const {
      facebookSignIn,
    } = this.props;

    if(!isConfirmationPage) {

      display = <Image style={styles.logo} source={require('./img/shareat_logo_with_name.png')}/>;

      form = <View style={styles.textInputContainer}>
                <TextInput style={styles.textInput} multiline={false} value={this.state.email}
                    placeholder='Email' placeholderTextColor='gray' onChangeText={(email) => this.setState({email})}/>
                <View style={styles.passwordContainer}>
                  <TextInput style={styles.textInputPw} multiline={false} secureTextEntry={true} value={this.state.pwd}
                    placeholder='Password' placeholderTextColor='gray' onChangeText={(pwd) => this.setState({pwd})}/>
                  <TouchableOpacity onPress={()=>{this.props.navigation.navigate('ForgotPassword');}}>
                    <Text style={styles.forgot}> Forgot? </Text>
                  </TouchableOpacity>
                </View>
              </View>;

      resendBtn = 
            <View style={{marginBottom: 30}} resizeMode='contain'>
              <TouchableOpacity onPress={()=> Auth.federatedSignIn({ provider: 'SignInWithApple'})}>
                  <Image style={[styles.thirdPartyBtn, {marginTop: -10}]} source={require('./img/continue_apple.png')} />
              </TouchableOpacity>
              <TouchableOpacity onPress={facebookSignIn}>
                 <Image style={[styles.thirdPartyBtn, {marginTop: -10, marginBottom: -20}]} source={require('./img/continue_fb.png')} />
              </TouchableOpacity>
            </View>;

      submitBtn = 
           <TouchableOpacity style={styles.signupBtn} onPress={this._login} color='#000000'>
             <Text style={styles.btnText}>Log In</Text>
          </TouchableOpacity>;

    } else {
      display = <Text style={styles.mfaText}>A One-Time Password has been sent to {this.state.email}</Text>;

      form = <View style={styles.textInputContainer}>
              <TextInput style={styles.textInput} multiline={false} value={this.state.confirmationCode} 
                placeholder='Confirmation Code' placeholderTextColor='gray' secureTextEntry={true} 
                onChangeText={(confirmationCode) => this.setState({confirmationCode})}/>
            </View>;

      resendBtn = 
          <View style={{marginBottom: 30}} resizeMode='contain'>
             <TouchableOpacity style={styles.resendBtn} onPress={this._resendEmail} color='#000000'>
                <Text style={styles.resendText}>{this.state.resendCodeText}</Text>
             </TouchableOpacity>
          </View>;

      submitBtn = 
         <TouchableOpacity style={styles.signupBtn} onPress={this._verifyEmail} color='#000000'>
           <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>;
    } 

    return (
      <KeyboardAwareScrollView style={{width: '100%'}}  innerRef={ref => {this.scroll = ref;}}
          contentContainerStyle={styles.container} bounces={false}>
        <StatusBar barStyle={'dark-content'} translucent={false}/>
        <SafeAreaView style={styles.stack} resizeMode='contain'>
             <TouchableOpacity style={{alignSelf: 'flex-start', marginTop: 30}} onPress={() => this.props.navigation.navigate('First')}>
               <Image style={{height: 30, width: 30, marginLeft: 20}} source={require('./img/backbtn.png')} />
            </TouchableOpacity>
            {display}
            {form}
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
            {resendBtn}
            {submitBtn}
        </SafeAreaView>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  stack: {
    width: '100%',
    flex: 1,
    marginTop: 20,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
    marginBottom: 10,
    color: 'red',
  },
  textInput: {
    height: 50, 
    width: '83%',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    color: 'gray',
    fontSize: 15,
  },
  textInputContainer: {
    width: '100%', 
    alignItems: 'center',
    zIndex: 0
  },
  textInputPw: {
    width: '83%',
    height: 50, 
    color: 'gray',
    fontSize: 15,
  },
  signupBtn: {
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    height: 45,
    borderRadius: 40,
    backgroundColor: '#ffa91f',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    elevation: 2 // Android
  },
  btnText: {
    color:'white',
    textAlign:'center',
    paddingTop: 11,
    fontSize: 15,
  },
  resendBtn: {
    marginTop: 50,
    marginBottom: - 20,
    width: '80%',
    height: 25,
    alignItems: 'center',
    marginRight: 20,
    marginLeft: 20,
  },
  resendText: {
    color: 'gray',
    textAlign:'center',
    fontSize: 12
  },
  mfaText: {
    color: 'gray',
    textAlign:'center',
    marginTop: 50,
    marginBottom: 50,
    fontSize: 12,
    width: '80%'
  },
  logo: {
    alignSelf: 'center',
    width: '40%',
    height: '40%',
    resizeMode: 'contain',
    paddingLeft: 30,
    marginTop: -25
  },
  passwordContainer: {
    justifyContent:'space-between',
    marginBottom: 0,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'gray',
    width: '83%',
  },
  forgot: {
    fontSize: 14,
    color: '#ffa91f',
    paddingTop: 15,
  },
  thirdPartyBtn: {
    alignItems: 'center', 
    resizeMode: 'contain',
    width: 220,
  }
});

export default withOAuth(LoginScreen);