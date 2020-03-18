
'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity,
  TextInput, StatusBar} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import SafeAreaView from 'react-native-safe-area-view';

import { Auth, Hub } from 'aws-amplify';
import { withOAuth } from 'aws-amplify-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

import {baseURL} from './Constants';

type Props = {};
class SignupScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = { 
      firstName: '',
      lastName: '',
      email: '',
      pwd: '',
      confirmPwd: '',
      confirmationCode: '',
      errorMessage: '',
      isSubmitted: false,
      resendCodeText: 'Resend One-Time Password',
      amazonUserSub: ''
     };

     Hub.listen('auth', async (data) => {
        switch (data.payload.event) {
            case 'signIn':
                try {
                  const user = await Auth.currentAuthenticatedUser();
                  this._saveUserToDB(user.signInUserSession.idToken.payload);
                  this.props.navigation.navigate('QR');
                } catch(err) {
                  console.log(err);
                }
                break;
            default:
                break;
          }
      });

     this._signup = this._signup.bind(this);
     this._verifyEmail = this._verifyEmail.bind(this);
     this._resendEmail = this._resendEmail.bind(this);
     this._saveUserToDB = this._saveUserToDB.bind(this);
  }

  async _signup() {

    const email = this.state.email.trim().toLowerCase();
    const firstName = this.state.firstName.trim();
    const lastName = this.state.lastName.trim();
    const pwd = this.state.pwd.trim();
    const confirmPwd = this.state.confirmPwd.trim();

    console.log(email);
   
    if(!this._passwordReqVerification(email, firstName, lastName, pwd, confirmPwd)) {
      return;
    }

    try {
      this.setState({email, firstName, lastName, pwd, confirmPwd});

      const user = await Auth.signUp({
        username: email,
        password: pwd,
        attributes: {
            'email' : email, 
            'family_name' : lastName,
            'given_name' : firstName,  
            'gender': 'not_specified'  
          }
        });
      this.setState({isSubmitted: true, AmazonUserSub: user.userSub, errorMessage: ''});
    } catch(err) {
      console.log(err);
      this.setState({errorMessage: err.message});
    }
  }

   async _verifyEmail() {

      this.setState({errorMessage: ''});
      try {
        console.log(this.state.email);
        await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);
        const user = await Auth.signIn(this.state.email, this.state.pwd);
        this._saveUserToDB(user.attributes);
        this.props.navigation.navigate('QR');
      } catch(err) {
        console.log(err);
        this.setState({errorMessage: err.message});
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

   async _saveUserToDB(attributes) {
    console.log(attributes.email);
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


  render() {

    const isSubmitted = this.state.isSubmitted;

    let form;
    let resendBtn;

    const {
      facebookSignIn,
    } = this.props;

    if(!isSubmitted) {
      form = <View style={styles.textInputContainer}>
              <TextInput style={styles.textInput} multiline={false} 
                value={this.state.email} placeholder='Email' placeholderTextColor='gray'
                onChangeText={(email) => this.setState({email: email})}/>
              <TextInput style={styles.textInput} multiline={false} 
                value={this.state.firstName} placeholder='First Name' placeholderTextColor='gray'
                onChangeText={(firstName) => this.setState({firstName: firstName.trim()})}/>
              <TextInput style={styles.textInput} multiline={false} 
                value={this.state.lastName} placeholder='Last Name' placeholderTextColor='gray'
                onChangeText={(lastName) => this.setState({lastName: lastName.trim()})}/>
              <TextInput style={styles.textInput} multiline={false} secureTextEntry={true}
                value={this.state.pwd} placeholder='Password' placeholderTextColor='gray'
                onChangeText={(pwd) => this.setState({pwd: pwd.trim()})}/>
              <TextInput style={styles.textInput} multiline={false} secureTextEntry={true}
                value={this.state.confirmPwd} placeholder='Confirm Password' placeholderTextColor='gray'
                onChangeText={(confirmPwd) => this.setState({confirmPwd: confirmPwd.trim()})}/>
            </View>;

      resendBtn = 
            <TouchableOpacity onPress={facebookSignIn}>
              <Image style={styles.facebook} source={require('./img/continue_fb.png')} />
            </TouchableOpacity>;
    } else {
       form = <View style={styles.textInputContainer}>
                <TextInput style={styles.textInput} multiline={false} secureTextEntry={true}
                  value={this.state.confirmationCode} placeholder='One-Time Password' placeholderTextColor='gray'
                  onChangeText={(confirmationCode) => this.setState({confirmationCode: confirmationCode.trim()})}/>
              </View>;

        resendBtn = 
            <TouchableOpacity style={styles.resendBtn} onPress={this._resendEmail} color='#000000'>
                <Text style={styles.resendText}>{this.state.resendCodeText}</Text>
            </TouchableOpacity>;
    }

    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.container} bounces={false}
         behavior='padding' resizeMode='contain' innerRef={ref => {this.scroll = ref;}}>
         <StatusBar barStyle={'dark-content'} translucent={false}/>
         <SafeAreaView style={styles.stack} resizeMode='contain' >
            <TouchableOpacity style={{alignSelf: 'flex-start', 'marginTop': 20}} onPress={() => this.props.navigation.navigate('First')}>
               <Image style={{height: 30, width: 30, marginLeft: 20}} source={require('./img/backbtn.png')} />
            </TouchableOpacity>
            {!isSubmitted ? <Image style={styles.logo} source={require('./img/splash_logo.png')} /> : null}
            {isSubmitted ? <Text style={styles.mfaText}>A One-Time Password has been sent to {this.state.email}</Text> : null}
            {form}
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
            <TouchableOpacity style={styles.signupBtn} onPress={isSubmitted ? this._verifyEmail : this._signup} color='#000000'>
                <Text style={styles.btnText}>Join Shareat</Text>
            </TouchableOpacity>
            {resendBtn}
        </SafeAreaView>
     </KeyboardAwareScrollView>
    );
  }


   _passwordReqVerification = (email, firstName, lastName, pwd, confirmPwd) => {

    if(email.length == 0) {
      this.setState({errorMessage: 'Please enter an email address'});
      return false;
    }

    if(firstName == 0) {
      this.setState({errorMessage: 'Please enter your firstName'});
      return false;
    }

    if(lastName == 0) {
      this.setState({errorMessage: 'Please enter your lastName'});
      return false;
    }


    if(pwd !== confirmPwd) {
      this.setState({errorMessage: 'Passwords do not match'});
      return false;
    }

    if(pwd.length < 8) {
      this.setState({errorMessage: 'Password must be longer than 7 characters'});
      return false;
    }

      var lowerLetterNum = 0;
      var upperLetterNum = 0;
      var numNum = 0;
      for(var i = 0; i < pwd.length ; i++) {
          if(pwd[i] >= '0' && pwd[i] <= '9') {
              numNum ++;
          }
          if((pwd[i] >= 'a' && pwd[i] <= 'z')){
              lowerLetterNum ++;
          }
          if((pwd[i] >= 'A' && pwd[i] <= 'Z')){
              upperLetterNum ++;
          }
      }
      if(!numNum){
          this.setState({errorMessage: 'Password must contain at least one number.'});
          return false;
      }
      if(!lowerLetterNum) {
          this.setState({errorMessage: 'Password must contain at least one lowercase letter.'});
          return false;
      }
      if(!upperLetterNum) {
          this.setState({errorMessage: 'Password must contain at least one uppercase letter.'});
          return false;
      }
      return true;
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
  stack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textInputContainer: {
    width: '100%', 
    alignItems: 'center',
    zIndex: 0
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  loginMessage: {
    textAlign: 'center',
    fontSize: 15,
    color: 'grey',
    marginBottom: 20,
  },
  welcome: {
    textAlign: 'center',
    color: 'gray',
    margin: 10,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    color: 'red',
  },
  textInput: {
    height: 45, 
    width: '80%',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  signupBtn: {
    marginTop: 35,
    marginBottom: 10,
    width: '80%',
    height: 45,
    backgroundColor: '#ffa91f',
    borderRadius: 40,
    alignItems: 'center',
    marginRight:20,
    marginLeft:20,
  },
  resendBtn: {
    marginTop: 15,
    marginBottom: 10,
    width: '80%',
    height: 25,
    alignItems: 'center',
    marginRight: 20,
    marginLeft: 20,
  },
  btnText: {
    color:'white',
    textAlign:'center',
    paddingTop: 10,
    fontSize: 15.5,
  },
  mfaText: {
    color: 'gray',
    textAlign:'center',
    marginTop: 50,
    marginBottom: 50,
    fontSize: 12,
    width: '80%'
  },
  resendText: {
    color: 'gray',
    textAlign:'center',
    fontSize: 12
  },
  logo: {
    height: '12%',
    width: '30%',
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 20,
    zIndex: 1
  },
  facebook: {
    alignItems: 'center', 
    resizeMode: 'contain',
    width: 220,
  }
});

export default withOAuth(SignupScreen);