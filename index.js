/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './app/App';
import {name as appName} from './app.json';
import Amplify from 'aws-amplify';


//amplify configuration
Amplify.configure({
    // To get the AWS Credentials, you need to configure 
    // the Auth module with your Cognito Federated Identity Pool
    Auth: {
        identityPoolId: 'us-west-2:d8a3d2cc-597f-4151-a953-825bba136e04',
        region: 'us-west-2',
        userPoolId: 'us-west-2_M8M7Yf1Be',
        userPoolWebClientId: '150pglql01h422eimesqd1jdsi',
        oauth: {
            domain: 'shareat.auth.us-west-2.amazoncognito.com',
            scope: ['email', 'openid'],
            redirectSignIn: 'shareat://',
            redirectSignOut: 'shareat://',
            responseType: 'code'
        }
    },
    Analytics: {
        AWSPinpoint: {
            // OPTIONAL -  Amazon Pinpoint App Client ID
            appId: '65b7dc1dd6bc4cff9af0bc42760758e0',
            // OPTIONAL -  Amazon service region
            region: 'us-east-1',
            optOut: 'NONE'
        }
    },
    Storage: {
        AWSS3: {
            bucket: 'shareat73dbe5d9abf1416d9450acd2397a9775-react', //REQUIRED -  Amazon S3 bucket
            region: 'us-west-2', //OPTIONAL -  Amazon service region
        }
    }
});

AppRegistry.registerComponent(appName, () => App);

// // WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

// const awsmobile = {
//     "aws_project_region": "us-west-2",
//     "aws_cognito_identity_pool_id": "us-west-2:d8a3d2cc-597f-4151-a953-825bba136e04",
//     "aws_cognito_region": "us-west-2",
//     "aws_user_pools_id": "us-west-2_M8M7Yf1Be",
//     "aws_user_pools_web_client_id": "150pglql01h422eimesqd1jdsi",
//     "oauth": {},
//     "aws_user_files_s3_bucket": "shareat73dbe5d9abf1416d9450acd2397a9775-react",
//     "aws_user_files_s3_bucket_region": "us-west-2"
// };


// export default awsmobile