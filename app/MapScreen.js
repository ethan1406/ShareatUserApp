
'use strict';

import React, {Component} from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import {StyleSheet, Text, View, TouchableOpacity, TextInput} from 'react-native';
import Dialog from 'react-native-dialog';
import axios from 'axios';

import {baseURL} from './Constants';

type Props = {};

const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.0421;
export default class MapScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude:  0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers: [],
      errorMessage: null,
      dialogVisible: false,
      searchString: '',
    };
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerTransparent: true
    };
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );

    axios.get(baseURL + '/map/allRestaurants/')
      .then((response) => {
      if(response.status == 200){
        try {
          var markers = [];
          response.data.forEach((merchant) => {
            var marker = {};
            marker['location'] = {};   
            marker['location']['latitude'] = merchant.location.latitude;
            marker['location']['longitude'] = merchant.location.longitude;
            marker['name'] = merchant.name;
            marker['description'] = merchant.description;
            marker['_id'] = merchant._id;
            markers.push(marker);
          });
          this.setState({markers: markers});
          
        } catch (err) {
          console.log(err);
        }
      } 
    }).catch((err) => {
      this.setState({errorMessage: err.response.data.error});
    });

  }

  _lookupRestaurant = (restaurantId, restaurantName) => {
    this.props.navigation.navigate('Restaurant', {
      restaurantName, restaurantId
    });
  }

  _searchRestaurant = async () => {
    try {
      const response = await axios.get(baseURL + '/map/find?name=' + this.state.searchString);
      if(response.data.length == 0) {
        this.setState({dialogVisible : true});
      } else {
        this.setState({markers: []});
        this.setState({markers: response.data,
                       region: {
                          latitude: response.data[0].location.latitude,
                          longitude: response.data[0].location.longitude,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA,
                        }});
      }

    } catch (err) {
      this.setState({errorMessage: err.message});
    }
  }

  _searchArea = async () => {
    try {
      const response = await axios.get(baseURL + '/map/allRestaurants/');
      this.setState({markers: []});
      this.setState({markers: response.data});

    } catch (err) {
      this.setState({errorMessage: err.message});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          provider={PROVIDER_GOOGLE}
          >
          {this.state.markers.map((marker, index) => (
            <Marker
              key={index}
              title={marker.name}
              description={marker.description}
              coordinate={marker.location}
              pinColor={'#F3A545'}
            >
                  <MapView.Callout tooltip={true} onPress={() => {this._lookupRestaurant(marker._id, marker.name);}}>
                        <View style={styles.calloutText}>
                            <Text style={{fontSize:14}}>{marker.name}</Text>
                            <Text style={{fontSize:11, color: 'gray'}}>{marker.description}</Text>
                        </View>
                  </MapView.Callout>
            </Marker>
          ))}
        </MapView>
        <View style={styles.buttonContainer}>
          <TextInput style={styles.textInput}  value={this.state.searchString}  
            onChangeText={(searchString) => this.setState({searchString})} onSubmitEditing={()=>this._searchRestaurant()}
            placeholder='search for restaurants' multiline={false}
          />
          <TouchableOpacity style={{marginTop: 10}} onPress={()=>this._searchArea()}>
            <View style={styles.searchAreaBtn}>
              <Text style={{color: 'gray'}}>Search this area</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Description>
            {`No results for ${this.state.searchString} on the map`}
          </Dialog.Description>
          <Dialog.Button label="Ok" onPress={()=> {this.setState({dialogVisible: false});}} />
        </Dialog.Container>
      </View>
    );
  }
}



const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  calloutText: {
    backgroundColor: 'white',
    padding: 8
  },
  buttonContainer: {
    flexDirection: 'column',
    position: 'absolute',
    alignItems: 'center',
    top: 80,
    //backgroundColor: 'rgba(255,255,255,0.7)',
    width: '80%'
  },
  searchAreaBtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  textInput: {
    backgroundColor: 'white',
    color: 'black',
    width: '100%',
    paddingHorizontal: 25,
    height: 50,
    borderRadius: 20 
  },
});