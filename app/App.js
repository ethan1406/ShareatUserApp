'use strict';

import React from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {Image} from 'react-native';
import FirstScreen from './FirstScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import AddPaymentMethodScreen from './AddPaymentMethodScreen';
import QrCodeScreen from './QrCodeScreen';
import OptionsScreen from './OptionsScreen';
import RewardsScreen from './RewardsScreen';
import RestaurantScreen from './RestaurantScreen';
import RecentOrderScreen from './RecentOrderScreen';
import ReceiptScreen from './ReceiptScreen';
import CheckSplitScreen from './CheckSplitScreen';
import ConfirmationScreen from './ConfirmationScreen';
import RewardAccumulationScreen from './RewardAccumulationScreen';
import OrderBuyerScreen from './OrderBuyerScreen';
import PaymentMethodsScreen from './PaymentMethodsScreen';
import EditProfileScreen from './EditProfileScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import RewardRedemptionScreen from './RewardRedemptionScreen';
import InformationScreen from './InformationScreen';
import {primaryColor, darkGray} from './Colors';


const CheckNavigator = createStackNavigator(
{
  QR: QrCodeScreen,
  Check: CheckSplitScreen,
  Confirmation: ConfirmationScreen,
  PaymentMethods: PaymentMethodsScreen,
  RewardAccumulation:  RewardAccumulationScreen
}
);

const CheckModalNavigator = createStackNavigator(
{
  CheckNavigator: {
    screen: CheckNavigator,
    navigationOptions: {
      headerShown: false
    }
  },
  OrderBuyer: OrderBuyerScreen
}, 
{
  mode: 'modal'
}
);

/**
const mapNavigator = createStackNavigator(
  {
    Map: MapScreen,
    Restaurant: RestaurantScreen
  }
);
**/

const OptionNavigator = createStackNavigator(
{
  Options: OptionsScreen,
  PaymentMethods: PaymentMethodsScreen,
  Restaurant: RestaurantScreen,
  RecentOrder: RecentOrderScreen,
  Receipt: ReceiptScreen,
  EditProfile: EditProfileScreen,
  ForgotPassword: {
    screen: ForgotPasswordScreen,
    navigationOptions: {
      headerShown: false,
    }
  }
}
);

const RewardNavigator = createStackNavigator(
{
  Rewards: RewardsScreen,
  Restaurant: RestaurantScreen
});


const main = createBottomTabNavigator({
  Reward: {
    screen: RewardNavigator,
    navigationOptions: {
      tabBarIcon: ({ tintColor, focused }) => (
        <Image
          source={require('./img/ic_gift.png')}
          style={{ tintColor: focused? primaryColor : darkGray, height: 28, width: 28, marginTop:-6}}
        />
        ),
    },
  },
  QR: {
    screen: CheckModalNavigator,
    navigationOptions: {
      tabBarIcon: ({ tintColor, focused }) => (
       <Image
          source={require('./img/ic_qr_code.png')}
          style={{ tintColor: focused? primaryColor : darkGray, height: 28, width: 28, marginTop:-6}}
        />
        )
    },
  },
  Options: {
    screen: OptionNavigator,
    navigationOptions: {
      tabBarIcon: ({ tintColor, focused }) => (
        <Image
          source={require('./img/ic_user.png')}
          style={{ tintColor: focused? primaryColor : darkGray, height: 35, width: 35}}
        />
        ),
    },
  }
},
{
  tabBarOptions: { showLabel: false },
});

const AppNavigator = createSwitchNavigator(
{
  Registration: createSwitchNavigator({
    First: {
      screen: FirstScreen,
    },
    LoginFlow: createStackNavigator({
      Login: {
        screen: LoginScreen,
        navigationOptions: {
          headerShown: false,
        },
      },
      ForgotPassword: {
        screen: ForgotPasswordScreen,
        navigationOptions: {
          headerShown: false,
        }
      }
    }),
    Signup: {
      screen: SignupScreen,
      navigationOptions: {
        headerShown: false,
      },
    }
  }),
  Root: createStackNavigator(
  {
    Main: {
      screen: main,
      path: 'main'
    },
    AddPaymentMethod: AddPaymentMethodScreen,
    Information: InformationScreen,
    Redeem: RewardRedemptionScreen
  },
  {
    mode: 'modal',
    headerMode: 'none',
  }
  )
}
);


const AppContainer = createAppContainer(AppNavigator);

const prefix = 'shareat://';

const app = () => <AppContainer uriPrefix={prefix} />;


export default app;
