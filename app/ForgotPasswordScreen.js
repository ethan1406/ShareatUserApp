'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, TextInput} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import SafeAreaView from 'react-native-safe-area-view';
import { Auth } from 'aws-amplify';

type Props = {};
export default class ForgotPasswordScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = { 
      email: '',
      pwd: '',
      errorMessage: '',
      confirmationCode: '',
      resendCodeText: 'Resend One-Time Password',
      isForgotSubmitPage: false
     };

     this._forgotPasswordSubmit = this._forgotPasswordSubmit.bind(this);
     this._forgotPassowordRequest = this._forgotPassowordRequest.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerTransparent: true,
    };
  }

  async _forgotPassowordRequest() {
    if(this.state.email.trim() === '') {
      this.setState({errorMessage: 'Please enter your email'});
      return;
    }

    try {
      await Auth.forgotPassword(this.state.email.trim().toLowerCase());
      this.setState({isForgotSubmitPage: true, errorMessage: ''});
    } catch(err) {
      console.log(err);
      this.setState({errorMessage: err.message});
    }
  }

  async _forgotPasswordSubmit() {
    if(this.state.pwd === '') {
      this.setState({errorMessage: 'Please enter your password'});
      return;
    }

    if(this.state.confirmationCode === '') {
      this.setState({errorMessage: 'Please enter your confirmation code'});
      return;
    }

    try {
      await Auth.forgotPasswordSubmit(this.state.email, this.state.confirmationCode, this.state.pwd);
      this.props.navigation.goBack();
    } catch(err) {
      console.log(err);
      this.setState({errorMessage: err.message});
    }
  }

  _scrollToInput (reactNode: any) {
    // Add a 'scroll' ref to your ScrollView
    this.scroll.props.scrollToFocusedInput(reactNode);
  }


  render() {

    const isForgotSubmitPage = this.state.isForgotSubmitPage;

    let display;
    let form;
    let submitBtn;

    if(!isForgotSubmitPage) {
      display = <Text style={styles.mfaText}>Enter your email address to reset your password</Text>;

      form = <View style={styles.textInputContainer}>
               <TextInput style={styles.textInput} multiline={false} value={this.state.email}
                      placeholder='Email' placeholderTextColor='gray' onChangeText={(email) => this.setState({email})}/>
             </View>;

      submitBtn = 
         <TouchableOpacity style={styles.signupBtn} onPress={this._forgotPassowordRequest} color='#000000'>
           <Text style={styles.btnText}>Resend Code</Text>
        </TouchableOpacity>;

    } else {
      display = <Text style={styles.mfaText}>A One-Time Password has been sent to {this.state.email}{'\n'}
                    Please Enter the code and your new password</Text>;

      form = <View style={styles.textInputContainer}>
                 <TextInput style={styles.textInput} multiline={false} value={this.state.pwd}
                    placeholder= 'New Password' placeholderTextColor='gray' onChangeText={(pwd) => this.setState({pwd})}/>
                 <TextInput style={styles.textInput} multiline={false} value={this.state.confirmationCode}
                    placeholder='Confrimation Code' placeholderTextColor='gray' onChangeText={(confirmationCode) => this.setState({confirmationCode})}/>
              </View>;
      
       submitBtn = 
         <TouchableOpacity style={styles.signupBtn} onPress={this._forgotPasswordSubmit} color='#000000'>
           <Text style={styles.btnText}>Update Password</Text>
        </TouchableOpacity>;
    }

    return (
      <KeyboardAwareScrollView style={{width: '100%'}}  innerRef={ref => {this.scroll = ref;}}
          contentContainerStyle={styles.container} bounces={false}>
        <SafeAreaView style={styles.stack} resizeMode='contain'>
             <TouchableOpacity style={{alignSelf: 'flex-start', marginTop: 30}} onPress={() => this.props.navigation.goBack()}>
               <Image style={{height: 30, width: 30, marginLeft: 20}} source={require('./img/backbtn.png')} />
            </TouchableOpacity>
            {display}
            {form}
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
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
    marginBottom: 0 ,
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
  }
});