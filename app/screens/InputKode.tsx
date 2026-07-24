/* eslint-disable react-native/no-inline-styles */
import { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Animated,
  BackHandler,
  NativeEventSubscription,
  ScrollView
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { EdgeInsets, withSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../App'
import { Produk, KeranjangItem } from '../types'
import styles from '../components/styles'

const { width } = Dimensions.get('window')

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InputKode'>
  route: RouteProp<RootStackParamList, 'InputKode'>
  insets: EdgeInsets
}

type State = {
  kodeInput: string
  fade: Animated.Value
  produk: Produk[]
  cart: KeranjangItem[]
}

class InputKode extends Component<Props, State> {
  backHandler: NativeEventSubscription | undefined
  constructor(props: Props) {
    super(props)
    this.state = {
      kodeInput: '',
      fade: new Animated.Value(0),
      produk: [],
      cart: []
    }
  }

  componentWillUnmount() {
    if(this.backHandler) {
      this.backHandler.remove()
    }
    if (this.props.route.params?.params?.handleBack) {
      this.props.route.params.params.handleBack()
    }
  }

  _backHandler = (): boolean => {
    return false
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    this._getProduk()
    this._getCart()
  }

  _getProduk = async () => {
    let data = await AsyncStorage.getItem('produk')
    if (data != null) {
      this.setState({
        produk: JSON.parse(data)
      })
    }
  }

  _getCart = async () => {
    let data = await AsyncStorage.getItem('keranjang')
    if (data != null) {
      this.setState({
        cart: JSON.parse(data)
      })
    }
  }

  _fadeIn = () => {
    Animated.timing(
      this.state.fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false
    }
    ).start()
  }

  _fadeOut = () => {
    Animated.timing(
      this.state.fade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }
    ).start()
  }

  _fill = (cart: KeranjangItem[], id: string) => {
    let fill = null
    if (cart.length > 0) {
      cart.map((c, index) => {
        if (c.id_produk == id) {
          fill = index
        }
      })
    }

    return fill
  }

  render() {
    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Icon style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <Text style={styles.title}>INPUT KODE PRODUK</Text>
        </View>
        <ScrollView>
          <View style={{ marginTop: 15 }}>
            <View style={{ backgroundColor: '#fff', paddingHorizontal: 20 }}>
              <View style={styles.formGroup}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Kode produk</Text>
                <TextInput onChangeText={(kodeInput) => {
                  this.setState({
                    kodeInput
                  })
                }} onKeyPress={() => { this._fadeOut() }} value={this.state.kodeInput} keyboardType="numeric" style={styles.formControl} />
              </View>
              <Animated.View style={{ width: width, opacity: this.state.fade }}>
                <Text style={[styles.fontReg, styles.textDanger, { fontSize: 13 }]}>Kode produk tidak ditemukan.</Text>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity onPress={() => {
          this.props.navigation.goBack()
          this.props.route.params?.params?.onSubmitCode?.(this.state.kodeInput)
        }} style={[styles.btn, styles.btnLg, styles.btnPrimary, { borderRadius: 0, paddingVertical: 15 }]}>
          <Text style={[styles.fontBold, styles.textWhite, styles.textCenter]}>Submit Kode Produk</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default withSafeAreaInsets<Omit<Props, 'insets'>>(InputKode)
