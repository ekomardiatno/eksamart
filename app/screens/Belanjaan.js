import { Component } from 'react'
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Animated,
  FlatList,
  BackHandler,
  Modal
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import dateFormat from '../helpers/dateFormat'
import numberFormat from '../helpers/numberFormat'
import RNFS from 'react-native-fs'
const { width, height } = Dimensions.get('window')
const styles = require('../components/styles')

class Belanjaan extends Component {
  backHandler;
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      produk: [],
      belanjaan: [],
      search: '',
      popup: false,
      popupData: [],
      idPopupData: null,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15),
      totalTransaksi: 0,
      totalAwalTransaksi: 0,
      bayar: 0,
      path: RNFS.ExternalStorageDirectoryPath + '/EksaMart/Struk/'
    }
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    this._getData()
    AsyncStorage.getItem('penjualan').then(item => {
      this.setState({
        belanjaan: JSON.parse(item)
      })
    })
    AsyncStorage.getItem('produk').then(p => {
      this.setState({
        produk: JSON.parse(p)
      })
    })
  }

  componentWillUnmount() {
    if(this.backHandler) {
      this.backHandler.remove()
    }
    if (this.props.route.params?.handleBack) {
      this.props.route.params.handleBack()
    }
  }

  _backHandler = () => {
  }

  _getData = async (finisher = null) => {
    let data = await AsyncStorage.getItem('transaksi')
    if (data != null) {
      this.setState({
        data: JSON.parse(data).reverse()
      }, () => {
        if (typeof finisher === 'function') {
          finisher()
        }
      })
    }
  }

  _search = async () => {
    let data = await AsyncStorage.getItem('transaksi')
    if (this.state.search != '') {
      let rs = []
      if (data != null) {
        JSON.parse(data).map(d => {
          let word = this.state.search
          if (d.id_transaksi.toString().indexOf(word) > -1) {
            rs.push(d)
          }
        })

        this.setState({
          data: rs
        })
      }
    } else {
      this._getData()
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
        popup: false,
      })
    }, 250)
  }

  _keyExtractor = (item, index) => item.id_transaksi.toString()
  _hapus = async (id, finisher = null) => {
    let transaksi = this.state.data.reverse()
    let penjualan = this.state.belanjaan
    let produk = this.state.produk
    let transaksiIndex = transaksi.map(t => {
      return t.id_transaksi
    }).indexOf(id)
    transaksi.splice(transaksiIndex, 1)
    let penjualanN = penjualan.filter(p => {
      return p.id_transaksi === id
    })
    for (let i = 0; i < penjualanN.length; i++) {
      let produkIndex = produk.map(p => {
        return p.id_produk
      }).indexOf(penjualanN[i].id_produk)
      produk[produkIndex].stok_produk += penjualanN[i].qty
    }
    penjualan = penjualan.filter(p => {
      return p.id_transaksi !== id
    })
    AsyncStorage.setItem('transaksi', JSON.stringify(transaksi))
    AsyncStorage.setItem('penjualan', JSON.stringify(penjualan))
    AsyncStorage.setItem('produk', JSON.stringify(produk))
    // RNFS.unlink(this.state.path + id + '.jpg')
    //   .then(() => {
    //     console.log('Deleted!')
    //   })
    if (typeof finisher === 'function') {
      finisher()
    }
  }

  render() {
    const { fade, toTop } = this.state
    const Header = () => {
      if (this.state.search == '') {
        return (
          <View style={[styles.wrapper, styles.alignCenter, { marginBottom: 15 }]}>
            <Text style={[styles.fontBold, styles.textBlack, styles.h1]}>Riwayat Transaksi</Text>
          </View>
        )
      } else {
        return (
          <View style={[styles.wrapper, styles.alignCenter, { marginBottom: 15 }]}>
            <Text style={[styles.textMuted, styles.fontReg, styles.h4, { marginBottom: 6 }]}>Kata kunci pencarian:</Text>
            <Text style={[styles.fontBold, styles.textBlack, styles.h1]}>{this.state.search}</Text>
          </View>
        )
      }
    }

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Icon style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <View style={{ borderWidth: 1, borderColor: '#eee', height: 37, flex: 1, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={[styles.alignCenter, styles.justifyCenter, { width: 35, height: 35 }]}>
              <Icon size={20} name="search" />
            </View>
            <TextInput onChangeText={(search) => {
              this.setState({ search })
              this._search()
            }} keyboardType="numeric" value={this.state.search} placeholder="Kode Transaksi" placeholderTextColor="#757575" style={[styles.fontReg, styles.textPrimary, { height: 35, paddingVertical: 0, paddingHorizontal: 15, borderLeftWidth: 1, flex: 1, borderColor: '#eee' }]} />
          </View>
        </View>
        <FlatList
          data={this.state.data}
          keyExtractor={this._keyExtractor}
          ListHeaderComponent={<Header />}
          ListEmptyComponent={<View style={[styles.wrapper, styles.alignCenter]}>
            <Text style={[styles.fontReg, styles.textMuted, styles.h4]}>Belum ada transaksi</Text>
          </View>}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity style={{ paddingHorizontal: 20, backgroundColor: '#fff', marginBottom: 10 }} onPress={() => {
                let data = []
                this.state.belanjaan.map(p => {
                  if (item.id_transaksi == p.id_transaksi) {
                    data.push(p)
                  }
                })
                this.setState({
                  popup: true,
                  popupData: data,
                  idPopupData: item.id_transaksi,
                  totalTransaksi: item.total,
                  totalAwalTransaksi: item.total_awal,
                  bayar: item.bayar
                })
              }} key={item.id_transaksi}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={[styles.h4, styles.fontBold, styles.textBlack, { marginBottom: 3 }]}>{item.id_transaksi}</Text>
                    <Text style={[styles.fontReg, styles.textMuted, { fontSize: 13 }]}>{dateFormat(item.tanggal)}</Text>
                  </View>
                  <View>
                    <Text style={[styles.textSuccess, styles.h4]}>{numberFormat(item.total)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
        <Modal
          visible={this.state.popup}
          statusBarTranslucent={true}
          onRequestClose={this.closeAlert}
          transparent={true}
          onShow={() => {
            this.fadeIn()
            this.toTop()
          }}
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.25)', justifyContent: 'flex-end', opacity: fade }}>
            <View style={{ alignItems: 'flex-end', marginHorizontal: 0, padding: 10, paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  this.closeAlert()
                }}
                style={{ width: 40, height: 40, borderRadius: 40 / 2, ...styles.bgLight, alignItems: 'center', justifyContent: 'center' }}
              ><Icon name="x" size={18} style={[styles.textDanger, { paddingVertical: 5 }]} /></TouchableOpacity>
            </View>
            <Animated.View style={{ backgroundColor: '#fff', width: '100%', borderTopRightRadius: 20, borderTopLeftRadius: 20, transform: [{ translateY: toTop }] }}>
              <View style={{ paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <Text style={[styles.fontBold, styles.textBlack, { fontSize: 16 }]}>Belanjaan</Text>
                <TouchableOpacity onPress={() => {
                  this.closeAlert()
                  this.props.navigation.navigate('Struk', {
                    id_transaksi: this.state.idPopupData
                  })
                }}>
                  <Text style={{ ...styles.textPrimary }}>Lihat struk</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ paddingHorizontal: 20, maxHeight: 60 / 100 * height }}>
                <View style={[styles.alignCenter, { marginBottom: 15 }]}>
                  <Text style={[styles.textMuted, styles.fontReg, { marginBottom: 3, fontSize: 13 }]}>Kode transaksi</Text>
                  <Text style={[styles.fontBold, styles.textBlack, styles.h4]}>{this.state.idPopupData}</Text>
                </View>
                <View style={{ marginBottom: 10 }}>
                  {
                    this.state.popupData.map((d, i) => {
                      return (
                        <View key={i} style={{ marginBottom: 5 }}>
                          <View style={{ flexDirection: 'row', marginHorizontal: -2, alignItems: 'flex-end' }}>
                            <Text style={[styles.fontBold, styles.textBlack, { flex: 1, marginHorizontal: 2 }]}>{d.nama_produk}</Text>
                            <Text style={[styles.fontReg, styles.textMuted, { width: 30, textAlign: 'center', marginHorizontal: 2 }]}>{numberFormat(d.qty)}</Text>
                            <Text style={[styles.fontReg, styles.textMuted, { textAlign: 'right', width: 70, marginHorizontal: 2 }]}>{numberFormat(d.harga_produk)}</Text>
                            <Text style={[styles.textBlack, { textAlign: 'right', width: 70, marginHorizontal: 2 }]}>{numberFormat(d.harga_produk * d.qty)}</Text>
                          </View>
                          {
                            d.diskon_produk * 100 > 0 &&
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Text>Disc.</Text>
                              <Text style={{ ...styles.textRight }}>{numberFormat(((d.harga_produk * (d.diskon_produk / 100)) * d.qty) * -1)}</Text>
                            </View>
                          }
                        </View>
                      )
                    })
                  }
                </View>
              </ScrollView>
              <View style={{ paddingVertical: 10, borderTopWidth: 1, borderColor: '#eee', marginHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', marginBottom: 5, marginHorizontal: -2 }}>
                  <Text style={{ ...styles.textMuted, flex: 1, marginHorizontal: 2 }}>Total Item</Text>
                  <Text style={[styles.fontReg, { width: 30, textAlign: 'center', marginHorizontal: 2 }]}>{
                    numberFormat(
                      this.state.popupData.reduce((total, a) => {
                        return total + a.qty
                      }, 0)
                    )
                  }</Text>
                  <Text style={[styles.fontReg, { textAlign: 'right', width: 144, marginHorizontal: 2 }]}>{numberFormat(this.state.totalAwalTransaksi)}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={{ ...styles.textMuted }}>Total Disc.</Text>
                  <Text>{numberFormat(this.state.totalTransaksi - this.state.totalAwalTransaksi)}</Text>
                </View>
                <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={{ ...styles.textMuted }}>Total Belanja</Text>
                  <Text style={{ ...styles.fontBold }}>{numberFormat(this.state.totalTransaksi)}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 20 }}>
                <View style={{ padding: 10, paddingHorizontal: 20, marginHorizontal: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20, ...styles.bgGrey }}>
                  <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginBottom: 5 }}>
                    <Text style={{ ...styles.textMuted }}>Tunai</Text>
                    <Text>{numberFormat(this.state.bayar)}</Text>
                  </View>
                  <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={{ ...styles.textMuted }}>Kembalian</Text>
                    <Text>{numberFormat(this.state.bayar - this.state.totalTransaksi)}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => {
                this._hapus(this.state.idPopupData, () => {
                  this.closeAlert()
                })
              }} style={[styles.bgDanger, { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }]}>
                <Text style={[styles.fontBold, styles.textWhite]}>Batalkan Transaksi</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Modal>
      </View>
    )
  }
}

export default Belanjaan