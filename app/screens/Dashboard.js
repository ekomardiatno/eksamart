/* eslint-disable react-native/no-inline-styles */
import { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  RefreshControl,
  Animated,
  FlatList,
  Modal,
  Image
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import numberFormat from '../helpers/numberFormat'
import dateFormat from '../helpers/dateFormat'
import RNFS from 'react-native-fs'

const styles = require('../components/styles')

const { width, height } = Dimensions.get('window')

class Dashboard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      transaksi: [],
      total: 0,
      penjualan: [],
      refresh: false,
      popup: false,
      popupData: [],
      idPopupData: null,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15),
      produk: [],
      transaksiToday: 0,
      tThisMonth: 0,
      pcsThisMonth: 0,
      rpThisMonth: 0,
      totalTransaksi: 0,
      totalAwalTransaksi: 0,
      bayar: 0,
      path: RNFS.ExternalStorageDirectoryPath + '/EksaMart/Struk/'
    }
  }

  componentDidMount() {
    this._getData(() => {
      this._getProduk(() => {
        this._getPenjualan(() => {
          this._getTotal()
          this._getTerjual()
        })
      })
    })
  }

  _getData = async (finisher = null) => {
    let data = await AsyncStorage.getItem('transaksi')
    if (data != null) {
      let date = new Date(),
        y = date.getFullYear(),
        m = (date.getMonth() + 1).toString().length < 2 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
        d = date.getDate().toString().length < 2 ? '0' + date.getDate() : date.getDate(),
        push = [],
        count = 0

      date = y + '-' + m + '-' + d

      JSON.parse(data).map(res => {
        if (res.tanggal.indexOf(date) > -1) {
          push.push(res)
          count = count + 1
        }
      })

      this.setState({
        transaksi: push.reverse(),
        transaksiToday: count
      }, () => {
        if (typeof finisher === 'function') {
          finisher()
        }
      })
    }
  }

  _getPenjualan = async (finisher = null) => {
    let data = await AsyncStorage.getItem('penjualan')
    if (data != null) {
      this.setState({
        penjualan: JSON.parse(data)
      }, () => {
        if (typeof finisher === 'function') {
          finisher()
        }
      })
    }
  }

  _getProduk = async (finisher = null) => {
    let data = await AsyncStorage.getItem('produk')
    if (data != null) {
      this.setState({
        produk: JSON.parse(data)
      }, () => {
        if (typeof finisher === 'function') {
          finisher()
        }
      })
    }
  }

  _getTotal = () => {
    let date = new Date(),
      y = date.getFullYear(),
      m = parseInt(date.getMonth()) + 1,
      d = date.getDate()

    let dt = y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2),
      total = 0

    this.state.transaksi.map(item => {
      if (item.tanggal.substr(0, 10) == dt) {
        total = item.total + total
      }
    })

    this.setState({ total })

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

  refresh = () => {
    console.log('yeay')
    this._getData(() => {
      this._getProduk(() => {
        this._getPenjualan(() => {
          this._getTotal()
          this._getTerjual()
        })
      })
    })
  }

  _onRefresh = () => {
    this.setState({
      refresh: true
    })

    this.refresh()

    this.setState({
      refresh: false
    })
  }

  _keyExtractor = (item, index) => item.id_transaksi.toString()
  _hapus = async (id, finisher = null) => {
    let transaksi = this.state.transaksi.reverse()
    let penjualan = this.state.penjualan
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
    AsyncStorage.setItem('produk', JSON.stringify(produk), () => {
      // RNFS.unlink(this.state.path + id + '.jpg')
      //   .then(() => {
      //     console.log('Deleted!')
      //   })
      if (typeof finisher === 'function') {
        finisher()
      }
    })
  }

  _getTerjual = async (finisher = null) => {
    let transaksi = await AsyncStorage.getItem('transaksi'),
      penjualan = this.state.penjualan,
      dt = new Date(),
      m = dt.getMonth()

    m = parseInt(m) + 1

    let y = dt.getFullYear()

    m = m.toString().length < 2 ? '0' + m : m

    let my = y + '-' + m

    let qtyP = 0,
      rpP = 0,
      tP = 0

    if (transaksi != null) {
      transaksi = JSON.parse(transaksi)

      for (let i = 0; i < transaksi.length; i++) {
        if (transaksi[i].tanggal.indexOf(my) > -1) {
          tP = tP + 1
          for (let j = 0; j < penjualan.length; j++) {
            if (penjualan[j].id_transaksi == transaksi[i].id_transaksi) {
              qtyP += penjualan[j].qty
              rpP += (penjualan[j].harga_produk * (1 - penjualan[j].diskon_produk / 100) - penjualan[j].modal_produk) * penjualan[j].qty
            }
          }
        }
      }

      this.setState({
        pcsThisMonth: qtyP,
        rpThisMonth: rpP,
        tThisMonth: tP
      }, () => {
        if (typeof finisher === 'function') {
          finisher()
        }
      })

    }

  }

  render() {
    const { fade, toTop } = this.state

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <Image style={{ height: 50, width: 50, marginRight: 5 }} source={require('../assets/images/EKSAMART.png')} />
          <Text style={{ ...styles.title, ...styles.textGrey }}>EKSAMART</Text>
        </View>
        <View style={{ marginBottom: 15, paddingTop: 5, marginHorizontal: 20 }}>
          <View style={styles.blueBox}>
            <View style={styles.headBlueBox}>
              <Text style={[styles.textHeadBlueBox]}>Penjualan hari ini</Text>
              <Text style={[styles.textHeadBlueBox, styles.textRight, styles.fontBold]}>{numberFormat(this.state.total)}</Text>
            </View>
            <View style={styles.bodyBlueBox}>
              <View style={[{ width: '33.3334%' }, styles.alignCenter]}>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate('Cart', {
                    handleBack: this.refresh
                  })
                }} style={styles.alignCenter}>
                  <View style={[styles.alignCenter, styles.justifyCenter, { width: 45, height: 45, borderRadius: 10, marginBottom: 6, borderWidth: 2, borderColor: '#fff' }]}>
                    <Icon name="shopping-cart" size={22} style={[styles.textWhite]} />
                  </View>
                  <Text style={[styles.textWhite, styles.textCenter, { fontSize: 11 }]}>Transaksi</Text>
                </TouchableOpacity>
              </View>
              <View style={[{ width: '33.3334%' }, styles.alignCenter]}>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate('ProductList')
                }} style={styles.alignCenter}>
                  <View style={[styles.alignCenter, styles.justifyCenter, { width: 45, height: 45, borderRadius: 10, marginBottom: 6, borderWidth: 2, borderColor: '#fff' }]}>
                    <Icon name="list" size={22} style={[styles.textWhite]} />
                  </View>
                  <Text style={[styles.textWhite, styles.textCenter, { fontSize: 11 }]}>Produk</Text>
                </TouchableOpacity>
              </View>
              <View style={[{ width: '33.3334%' }, styles.alignCenter]}>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate('Toko')
                }} style={styles.alignCenter}>
                  <View style={[styles.alignCenter, styles.justifyCenter, { width: 45, height: 45, borderRadius: 10, marginBottom: 6, borderWidth: 2, borderColor: '#fff' }]}>
                    <Icon name="home" size={22} style={[styles.textWhite]} />
                  </View>
                  <Text style={[styles.textWhite, styles.textCenter, { fontSize: 11 }]}>Toko</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <FlatList
          style={{ backgroundColor: '#fff' }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._onRefresh}
            />
          }
          ListHeaderComponent={
            <View style={{ marginHorizontal: 20 }}>
              <View style={{ ...styles.bgSuccess, borderRadius: 4, marginBottom: 15 }}>
                <Text style={{ ...styles.fontReg, ...styles.fontBold, ...styles.textWhite, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: 'rgba(0,0,0,.05)' }}>Penjualan bulan ini</Text>
                <View style={[styles.alignCenter, styles.justifyCenter, { flexDirection: 'row', marginBottom: 0 }]}>
                  <View style={[styles.alignCenter, { width: (width - 20) / 3, paddingHorizontal: 15, paddingVertical: 10 }]}>
                    <Text style={[styles.fontReg, styles.textWhite, { textAlign: 'center' }]}>Transaksi</Text>
                    <Text style={[styles.fontBold, styles.textWhite, { textAlign: 'center' }]}>{numberFormat(this.state.tThisMonth)}</Text>
                  </View>
                  <View style={[styles.alignCenter, { width: (width - 20) / 3, paddingHorizontal: 15, paddingVertical: 10 }]}>
                    <Text style={[styles.fontReg, styles.textWhite, { textAlign: 'center' }]}>Terjual</Text>
                    <Text style={[styles.fontBold, styles.textWhite, { textAlign: 'center' }]}>{numberFormat(this.state.pcsThisMonth)} pcs</Text>
                  </View>
                  <View style={[styles.alignCenter, { width: (width - 20) / 3, paddingHorizontal: 15, paddingVertical: 10 }]}>
                    <Text style={[styles.fontReg, styles.textWhite, { textAlign: 'center' }]}>Keuntungan</Text>
                    <Text style={[styles.fontBold, styles.textWhite, { textAlign: 'center' }]}>{numberFormat(this.state.rpThisMonth)}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.alignCenter, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }]}>
                <Text style={[styles.textBlack, styles.fontBold]}>Transaksi hari ini ({this.state.transaksiToday})</Text>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate('Belanjaan', {
                    handleBack: this.refresh
                  })
                }}>
                  <Text style={[styles.textMuted, styles.fontReg]}>Lihat semua</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={<View style={{ height: 100, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20 }}>
            <Text style={[styles.textMuted, styles.fontReg]}>Belum ada transaksi</Text>
          </View>}
          data={this.state.transaksi}
          keyExtractor={this._keyExtractor}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity style={{ marginHorizontal: 20 }} key={item.id_transaksi} onPress={() => {
                let data = []
                this.state.penjualan.map(p => {
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
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
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
                  this.refresh()
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

export default Dashboard