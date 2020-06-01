'use strict';

import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, Text, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import axios from 'axios';
import {baseURL} from './Constants';
import {primaryColor, secondaryColor, darkGray} from './Colors';


type Props = {};
export default class InformationScreen extends Component<Props> {

  constructor(props) {
    super(props);
    const {url} = this.props.navigation.state.params;

    this.state = {
        sections: [],
        url
    };
  }

  static navigationOptions = ({navigation}) => {
    return{
      headerLeft: ()=>
          <TouchableOpacity onPress={() => navigation.goBack(null)}>
             <Image style={{height: 30, width: 30, marginLeft: 20, tintColor: primaryColor}} source={require('./img/backbtn.png')} />
          </TouchableOpacity>
      ,
      title: navigation.state.params.restaurantName,
      headerStyle: {
        backgroundColor: secondaryColor,
      },
      headerTintColor: darkGray,

      headerTitleAlign: 'center'
    };
  }

  async componentDidMount() {

    try {
      const {data} = await axios.get(`${baseURL}/user/${this.state.url}`);
      this.setState({sections: data.sections});
    } catch(err) {
      console.log(err);
    }
    
  }

  render() {
    var title = '';
    if (this.state.url === 'private-policy') {
      title = 'Private Policy';
    } else if (this.state.url === 'terms-of-use') {
      title = 'Terms of Use';
    } else if (this.state.url === 'contact-us') {
      title = 'Contact Us';
    }


    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity  onPress={() => this.props.navigation.goBack()}>
              <Image style={{height: 30, width: 30, marginLeft: 10}} source={require('./img/cancelbtn.png')}/>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Text style={styles.header}> {title} </Text>
          {this.state.sections.map(section => (
              <View>
                <Text style={styles.sectionHeader}>{section.header}</Text>
                {section.paragraph.map(part => {
                  if (part.type === 'bullet') {
                    if (part.content.indexOf('.') !== -1) {
                      return ( 
                        <Text style={styles[part.type]}>
                          <Text style={{fontWeight: 'bold'}}>{part.content.substr(0, part.content.indexOf('.'))}</Text>
                          <Text>{part.content.substr(part.content.indexOf('.'))}</Text>
                        </Text>
                      );
                    }
                  }
                  return <Text style={styles[part.type]}>{part.content}</Text>;
                })}
                {section.sections === undefined ? null : section.sections.map(subSection => (
                  <View>
                    <Text style={styles.subSectionHeader}>{subSection.header}</Text>
                    {subSection.paragraph.map(part => {
                      if (part.type === 'bullet') {
                      if (part.content.indexOf('.') !== -1) {
                          return ( 
                            <Text style={styles[part.type]}>
                              <Text style={{fontWeight: 'bold'}}>{part.content.substr(0, part.content.indexOf('.'))}</Text>
                              <Text>{part.content.substr(part.content.indexOf('.'))}</Text>
                            </Text>
                          );
                        }
                      }
                      return <Text style={styles[part.type]}>{part.content}</Text>;
                    })}
                  </View>
                ))}
              </View>
            )
          )}
        </ScrollView>
      </SafeAreaView>
    );
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  topBar: {
    flexDirection: 'row', 
    width: '100%',
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    marginBottom: 20,
  },
  header: {
    alignSelf: 'flex-start',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: -15
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 15
  },
  subSectionHeader: {
    fontWeight: 'bold',
    margin: 15
  },
  info: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    lineHeight: 20
  },
  bullet: {
    lineHeight: 20,
    marginLeft: 15,
    marginRight: 15
  }
});
