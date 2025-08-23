import { Component } from 'react'
import {
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  ScrollView,
  ToastAndroid,
  Modal
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import numberFormat from '../helpers/numberFormat'
import { withSafeAreaInsets } from 'react-native-safe-area-context'

const styles = require('../components/styles')

class Pembayaran extends Component {
  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      bayar: 0,
      kembalian: 0,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15),
      alert: false,
      cart: [],
      penjualan: [],
      transaksi: [],
      produk: []
    }
  }
  componentDidMount() {
    this.penjualan()
    this.cart()
    this.transaksi()
    this.produk()

    this.setState({
      total: this.props.route.params.total
    })
  }

  penjualan = async () => {
    let penjualan = await AsyncStorage.getItem('penjualan')
    if (penjualan != null) {
      this.setState({
        penjualan: JSON.parse(penjualan)
      })
    }
  }

  cart = async () => {
    let cart = await AsyncStorage.getItem('keranjang')
    if (cart != null) {
      this.setState({
        cart: JSON.parse(cart)
      })
    }
  }

  produk = async () => {
    let produk = await AsyncStorage.getItem('produk')
    if (produk != null) {
      this.setState({
        produk: JSON.parse(produk)
      })
    }
  }

  transaksi = async () => {
    let transaksi = await AsyncStorage.getItem('transaksi')
    if (transaksi != null) {
      this.setState({
        transaksi: JSON.parse(transaksi)
      })
    }
  }

  fadeIn = () => {
    Animated.timing(
      this.state.fade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false
    }
    ).start()
  }

  fadeOut = () => {
    Animated.timing(
      this.state.fade, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false
    }
    ).start()
  }

  toTop = () => {
    Animated.timing(
      this.state.toTop, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false
    }
    ).start()
  }

  toBottom = () => {
    Animated.timing(
      this.state.toTop, {
      toValue: 15,
      duration: 250,
      useNativeDriver: false
    }
    ).start()
  }

  closeAlert = () => {
    this.fadeOut()
    this.toBottom()
    setTimeout(() => {
      this.setState({
        alert: false
      })
    }, 250)
  }

  openAlert = () => {
    this.setState({
      alert: true
    })
  }

  selesai = async () => {
    let cart = this.state.cart
    let transaksi = this.state.transaksi
    let penjualan = this.state.penjualan
    let produk = this.state.produk
    let date = new Date()
    let y = date.getFullYear(),
      m = (date.getMonth() + 1).toString().length < 2 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
      d = date.getDate().toString().length < 2 ? '0' + date.getDate() : date.getDate(),
      h = date.getHours().toString().length < 2 ? '0' + date.getHours() : date.getHours(),
      i = date.getMinutes().toString().length < 2 ? '0' + date.getMinutes() : date.getMinutes(),
      s = date.getSeconds().toString().length < 2 ? '0' + date.getSeconds() : date.getSeconds()
    let id = date.getTime()
    let totalAwal = 0
    let dateTime = y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s
    for (let i = 0; i < cart.length; i++) {
      let produkN = produk.filter(p => {
        return p.id_produk === cart[i].id_produk
      })[0]
      penjualan.push({
        'id_transaksi': id,
        'id_produk': cart[i].id_produk,
        'nama_produk': produkN.nama_produk,
        'harga_produk': produkN.harga_produk,
        'diskon_produk': produkN.diskon_produk,
        'modal_produk': produkN.modal_produk,
        'qty': cart[i].qty
      })
      totalAwal += produkN.harga_produk * cart[i].qty
    }

    AsyncStorage.setItem('penjualan', JSON.stringify(penjualan)).then(() => {
      transaksi.push({
        'id_transaksi': id,
        'tanggal': dateTime,
        'total': this.state.total,
        'total_awal': totalAwal,
        'bayar': this.state.bayar
      })
      AsyncStorage.setItem('transaksi', JSON.stringify(transaksi)).then(() => {
        AsyncStorage.removeItem('keranjang').then(() => {
          this.props.navigation.replace('Struk', {
            id_transaksi: id,
            handleBack: this.props.route.params.handleBack
          })
        })
      })
    })

  }

  render() {
    const { fade, toTop } = this.state
    const Alert = () => {
      return (
        <Modal
          visible={this.state.alert}
          statusBarTranslucent={true}
          onRequestClose={this.closeAlert}
          transparent={true}
          onShow={() => {
            this.fadeIn()
            this.toTop()
          }}
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.25)', justifyContent: 'center', opacity: fade }}>
            <View style={{ padding: 20 }}>
              <Animated.View style={{ backgroundColor: '#fff', borderRadius: 3, transform: [{ translateY: toTop }] }}>
                <View style={{ padding: 15 }}>
                  <Text style={[styles.h4, styles.fontReg]}>Yakin ingin menyelesaikan transaksi?</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 15, justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => {
                    this.closeAlert()
                  }}><Text style={{ ...styles.btn, marginHorizontal: 5 }}>{'Batal'.toUpperCase()}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    this.closeAlert()
                    this.selesai()
                  }}><Text style={{ ...styles.btn, ...styles.btnPrimary, ...styles.textWhite, marginHorizontal: 5 }}>{'Selesai'.toUpperCase()}</Text></TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Modal>
      )
    }
    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Icon style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <Text style={styles.title}>Pembayaran</Text>
        </View>
        <View style={[styles.wrapper, styles.alignCenter]}>
          <Text style={[styles.textMuted, styles.fontReg, styles.h4, { marginBottom: 6 }]}>Total yang harus dibayar</Text>
          <Text style={[styles.fontBold, styles.textSuccess, styles.h1]}>{numberFormat(this.state.total)}</Text>
        </View>
        <ScrollView>
          <View style={{ padding: 15, paddingHorizontal: 20, backgroundColor: '#fff' }}>
            <View style={styles.formGroup}>
              <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Bayaran</Text>
              <TextInput keyboardType="numeric" onChangeText={(bayar) => {
                bayar = parseInt(bayar.replace(/,/g, ''))
                this.setState({
                  bayar,
                  kembalian: bayar - this.state.total
                })
              }} value={numberFormat(this.state.bayar)} style={styles.formControl} />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Kembalian</Text>
              <TextInput editable={false} value={numberFormat(this.state.kembalian)} style={[styles.formControl, styles.formGrey]} />
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity onPress={() => {
          if (this.state.cart.length <= 0 && this.state.produk.length <= 0) {
            ToastAndroid.show('Mohon tunggu', ToastAndroid.SHORT)
          } else if (this.state.bayar >= this.state.total) {
            this.openAlert()
            Keyboard.dismiss()
          } else {
            ToastAndroid.show('Bayaran tidak cukup', ToastAndroid.SHORT)
          }
        }} style={[styles.btn, styles.btnLg, (this.state.cart.length <= 0 && this.state.produk.length <= 0 ? styles.bgGrey : styles.btnPrimary), { borderRadius: 0, paddingVertical: 15 }]}>
          <Text style={[styles.fontBold, styles.textWhite, styles.textCenter]}>Selesai</Text>
        </TouchableOpacity>
        <Alert />
      </View>
    )
  }
}

export default withSafeAreaInsets(Pembayaran)