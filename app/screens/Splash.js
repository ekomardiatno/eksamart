/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet, StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Linking
} from 'react-native'

const {width, height} = Dimensions.get('window')

class Splash extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fadeIn: new Animated.Value(0),
      fade: new Animated.Value(0),
      update: false
    }
  }

  componentDidMount() {
    Animated.timing(
      this.state.fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false
      }
    ).start(() => {
      this.navigate()
    })
  }

  fadeIn = () => {
    Animated.timing(
      this.state.fade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }
    ).start()
  }

  navigate = () => {
    setTimeout(() => {
      this.props.navigation.replace('Home')
    }, 2000)
  }

  render() {
    let { fadeIn, fade } = this.state

    const Update = () => {
      if(this.state.update) {
        return (
          <Animated.View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,.5)', opacity: fade, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{padding: 20, width: width}}>
              <View style={{backgroundColor: '#fff', borderRadius: 4, padding: 15}}>
                <Text style={{fontFamily: 'RobotoCondensed'}}>Pembaruan aplikasi tersedia. Segera perbarui untuk tetap bisa menggunakan aplikasi.</Text>
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15}}>
                  <TouchableOpacity onPress={() => {
                    Linking.openURL("market://details?id=com.koma.emart")
                  }} style={{paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#eee', borderRadius: 3}}>
                    <Text style={{fontFamily: 'RobotoCondensed', fontWeight: 'bold'}}>UPDATE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )
      } else {
        return null
      }
    }
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle='dark-content' />
        <Animated.Image style={{ width: 300, height: 300, opacity: fadeIn }} source={require('../assets/images/EKSAMART.png')} />
        <Update />
      </View>
    )
  }
}

export default Splash

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  }
})