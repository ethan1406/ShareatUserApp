'use strict';

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, TextInput} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import AsyncStorage from '@react-native-community/async-storage';
import { Auth } from 'aws-amplify';
import {primaryColor, secondaryColor, darkGray} from './Colors';
import {headerFontSize} from './Dimensions';
import { Analytics } from 'aws-amplify';

type props = {};

export default class EditProfileScreen extends Component<props> {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            oldPwd: '',
            newPwd: '',
            confirmNewPwd: '',
            errorMessage: '',
            isChangePassword: false,
            messageColor: 'red'
        };

        this._saveAttributes = this._saveAttributes.bind(this);
        this._changePassword = this._changePassword.bind(this);
        this._switchSubPage = this._switchSubPage.bind(this);
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: ()=> ( 
              <TouchableOpacity onPress={() => navigation.goBack(null)}>
                 <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
              </TouchableOpacity>
            ),
            title: 'Edit Profile',
            headerStyle: {
                backgroundColor: secondaryColor,
            },
            headerTitleAlign: 'center',
            headerTintColor: darkGray,
            headerTitleStyle: {
                fontSize: headerFontSize, 
            } 
        };
    }

async componentDidMount() {
    try {
      Analytics.record({
        name: 'pageView',
        attributes: {
          page: 'profile',
          subPage: 'editName'
        }
      });

      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      this.setState({firstName, lastName});
  } catch (err) {
      this.setState({errorMessage: err.message});
  }
}

async _saveAttributes() {
    const firstName = this.state.firstName.trim();
    const lastName = this.state.lastName.trim();

    if(firstName === '') {
      this.setState({errorMessage: 'First name cannot be empty', 'messageColor': 'red'});
      return;
  }

  if(lastName === '') {
      this.setState({errorMessage: 'Last name cannot be empty', 'messageColor': 'red'});
      return;
  }

  try {
    const user = await Auth.currentAuthenticatedUser();

    await Auth.updateUserAttributes(user, {
        'given_name': firstName,
        'family_name': lastName
    });
    await AsyncStorage.setItem('firstName', firstName);
    await AsyncStorage.setItem('lastName', lastName);
    this.setState({errorMessage: 'saved successfully!', 'messageColor': 'green'});

    Analytics.record({
      name: 'action',
      attributes: {page: 'profile', actionType: 'changeName'}
    });

  } catch(err) {
      console.log(err);
      this.setState({errorMessage: err.message, 'messageColor': 'red'});
  }
}

async _changePassword() {
    if(this.state.oldPwd === '') {
      this.setState({errorMessage: 'Please enter your old password', 'messageColor': 'red'});
      return;
  }

  if(!this._passwordReqVerification(this.state.oldPwd, this.state.newPwd, this.state.confirmNewPwd)){
    return;
  }

  try {
      const user = await Auth.currentAuthenticatedUser();
      const test = await Auth.changePassword(user, 
          this.state.oldPwd, this.state.newPwd
          );
      this.setState({errorMessage: 'saved successfully!', 'messageColor': 'green'});

      Analytics.record({
        name: 'action',
        attributes: {page: 'profile', actionType: 'changePassword'}
      });
  } catch(err) {
      console.log(err);
      this.setState({errorMessage: err.message, 'messageColor': 'red'});
  }
}

_switchSubPage() {
  Analytics.record({
    name: 'pageView',
    attributes: {
      page: 'profile',
      subPage: this.isChangePassword ? 'editPassword' : 'editName'
    }
  });

  this.setState({isChangePassword: !this.state.isChangePassword, errorMessage: ''});
}


render() {
    const isChangePassword = this.state.isChangePassword;

    let form;
    let changeText;

    if(!isChangePassword) {
        form = <View style={styles.textInputContainer}>
        <Text style={{color:'gray'}}>First Name</Text>
        <TextInput style={styles.textInput} multiline={false} value={this.state.firstName}
        onChangeText={(firstName) => this.setState({firstName})}/>
        <Text style={{color:'gray'}}>Last Name</Text>
        <TextInput style={styles.textInput} multiline={false} value={this.state.lastName}
        onChangeText={(lastName) => this.setState({lastName})}/>
        </View>;

        changeText = 'Change Password';
    } else {
        form = <View style={styles.textInputContainer}>
        <Text style={{color:'gray'}}>Old Password</Text>
        <TextInput style={styles.textInput} multiline={false} value={this.state.oldPwd}
        onChangeText={(oldPwd) => this.setState({oldPwd})} secureTextEntry={true}/>
        <Text style={{color:'gray'}}>New Password</Text>
        <TextInput style={styles.textInput} multiline={false} value={this.state.newPwd}
        onChangeText={(newPwd) => this.setState({newPwd})} secureTextEntry={true}/>
        <Text style={{color:'gray'}}>Confrim New Password</Text>
        <TextInput style={styles.textInput} multiline={false} value={this.state.confirmNewPwd}
        onChangeText={(confirmNewPwd) => this.setState({confirmNewPwd})} secureTextEntry={true}/>
        <TouchableOpacity onPress={()=> this.props.navigation.navigate('ForgotPassword')}color='#000000'>
        <Text style={styles.forgotBtnText}>Forgot Your Password?</Text>
        </TouchableOpacity>  
        </View>;

        changeText = 'Change Profile';
    }

    return(
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
          <Image style={styles.userIcon} source={require('./img/splash_logo.png')}/>
          {form}
          <TouchableOpacity 
            onPress={this._switchSubPage} color='#000000'>
            <Text style={styles.forgotBtnText}>{changeText}</Text>
          </TouchableOpacity>  
          <TouchableOpacity style={styles.signupBtn} onPress={!isChangePassword ? this._saveAttributes : this._changePassword} color='#000000'>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>  
          <Text style={[styles.errorMessage, {color: this.state.messageColor}]}>{this.state.errorMessage}</Text>
        </KeyboardAwareScrollView>
        );
}

_passwordReqVerification = (oldPwd, pwd, confirmPwd) => {
    if(pwd !== confirmPwd) {
        console.log('here1.2');
        this.setState({errorMessage: 'Passwords do not match', messageColor: 'red'});
        return false;
    }

    if(pwd.length < 8 || oldPwd.length < 8) {
        this.setState({errorMessage: 'Password must be longer than 7 characters', messageColor: 'red'});
        return false;
    }

    if(!this._criteriaSatisfied(oldPwd) || !this._criteriaSatisfied(pwd)) {
        return false;
    }
    return true;
}

_criteriaSatisfied = (pwd) => {
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
      this.setState({errorMessage: 'Password must contain at least one number.', messageColor: 'red'});
      return false;
  }
  if(!lowerLetterNum) {
      this.setState({errorMessage: 'Password must contain at least one lowercase letter.', messageColor: 'red'});
      return false;
  }
  if(!upperLetterNum) {
      this.setState({errorMessage: 'Password must contain at least one uppercase letter.', messageColor: 'red'});
      return false;
  }
  return true;
}
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: 'white', 
        justifyContent: 'flex-start', 
        alignItems: 'center',
        height: '100%'
    },
    userIcon: {
        marginTop: 40,
        width: 100,
        height: 100,
        resizeMode: 'contain'
    },
    textInput: {
        height: 40, 
        width: '100%',
        borderBottomColor: darkGray,
        borderBottomWidth: 0.5,
        color: 'black',
        fontSize: 15,
        marginBottom: 25,
    },
    text: {
        color: darkGray,
        fontSize: 12,
    },
    textInputContainer: {
        width: '88%',
        marginTop: 30,
        flexDirection: 'column',
        flex:1, 
        justifyContent: 'flex-start', 
    },
    signupBtn: {
        marginBottom: 10,
        width: '80%',
        height: 45,
        borderRadius: 40,
        backgroundColor: primaryColor,
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2 // Android
    },
    forgotBtnText: {
        marginBottom: 40,
        color: primaryColor,
        alignSelf: 'flex-start',
        width: '50%',
    },
    btnText: {
        color:'white',
        textAlign:'center',
        paddingTop: 11,
        fontSize: 15,
    },
    errorMessage: {
        textAlign: 'center',
        fontSize: 13,
        marginTop: 10,
        marginBottom: 20,
        color: 'red',
    }
});