/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  ScrollView, Animated,
  BackHandler,
  ToastAndroid,
  Modal
} from 'react-native'

import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import numberFormat from '../helpers/numberFormat'

const styles = require('../components/styles')

class InfoProduk extends Component {
  backHandler
  constructor(props) {
    super(props)
    this.state = {
      nama: '',
      data: [],
      modal: 0,
      harga: 0,
      diskon: 0,
      alert: false,
      alertBody: '',
      registered: true,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15)
    }
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    AsyncStorage.getItem('produk').then(item => {
      console.log(item)
      if (item !== null) {
        item = JSON.parse(item)
        this.setState({
          data: item
        }, () => {
          this._check()
        })
      } else {
        this._check()
      }
    })

  }

  componentWillUnmount() {
    if(this.backHandler) {
      this.backHandler.remove()
    }
    if (this.props.route.params.refresh !== null) {
      this.props.route.params.refresh()
    }
    if (this.props.route.params?.handleBack) {
      this.props.route.params.handleBack()
    }
  }

  _backHandler = () => {
  }

  _check = () => {
    if (this.state.data.length > 0) {
      this.setState({
        alert: true,
        alertBody: 'Produk belum terdaftar!'
      })
      let data = this.state.data.filter(d => {
        return d.id_produk === this.props.route.params.id
      })[0]
      if (data) {
        this.setState({
          nama: data.nama_produk,
          harga: data.harga_produk,
          modal: data.modal_produk,
          diskon: data.diskon_produk,
          alert: true,
          alertBody: 'Produk sudah terdaftar!'
        })
        let fromList = this.props.route.params.fromList
        if (fromList !== null) {
          if (fromList) {
            this.setState({
              alert: false
            })
          }
        }
      }
    } else {
      this.setState({
        alert: true,
        alertBody: 'Produk pertama untuk didaftarkan!'
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

  closeAlert = (finisher = null) => {
    this.fadeOut()
    this.toBottom()
    setTimeout(() => {
      this.setState({
        alert: false
      }, () => {
        if(typeof finisher === 'function') {
          finisher()
        }
      })
    }, 250)
  }

  simpan = async () => {
    let id = this.props.route.params.id,
      nama = this.state.nama,
      modal = this.state.modal,
      harga = this.state.harga,
      diskon = this.state.diskon

    let produk = {
      'id_produk': id,
      'nama_produk': nama,
      'modal_produk': parseInt(modal),
      'harga_produk': parseInt(harga),
      'diskon_produk': parseInt(diskon),
      'stok_produk': 0
    }

    const rs = await AsyncStorage.getItem('produk')
    if (rs !== null) {
      let data = JSON.parse(rs)
      let data2 = JSON.parse(rs)
      data2.push(produk)
      let dataBaru = data2
      this.setState({
        alertBody: 'Produk berhasil disimpan.'
      })
      data.forEach((item, index) => {
        if (item.id_produk == this.props.route.params.id) {
          data[index].nama_produk = nama
          data[index].harga_produk = parseInt(harga)
          data[index].diskon_produk = parseInt(diskon)
          data[index].modal_produk = parseInt(modal)
          this.setState({
            alertBody: 'Info produk diperbarui.'
          })
          dataBaru = data
        }
      })

      AsyncStorage.setItem('produk', JSON.stringify(dataBaru))
    } else {
      AsyncStorage.setItem('produk', JSON.stringify([produk]))
      this.setState({
        alertBody: 'Produk berhasil disimpan.'
      })
    }

    this.setState({
      alert: true,
      registered: false
    })
  }

  render() {
    const id = this.props.route.params.id
    let { nama, harga, modal, diskon, fade, toTop, alertBody, registered } = this.state

    const AlertDialog = () => {
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
                  <Text style={[styles.h4, styles.fontReg]}>{alertBody}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 15, justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => {
                    if (registered) {
                      this.closeAlert()
                    } else {
                      this.closeAlert(() => {
                        this.props.navigation.goBack()
                      })
                    }
                  }}><Text style={{ ...styles.btn, ...styles.btnPrimary, ...styles.textWhite, marginHorizontal: 5 }}>{'Tutup'.toUpperCase()}</Text></TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Modal>
      )
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Icon style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <Text style={styles.title}>Info Produk</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} enabled>
          <ScrollView style={styles.main}>
            <View style={[styles.wrapper, styles.alignCenter]}>
              <Text style={[styles.textMuted, styles.fontReg, styles.h4, { marginBottom: 6, textAlign: 'center' }]}>Kode produk</Text>
              <Text style={[styles.fontBold, styles.textBlack, styles.h1, { textAlign: 'center' }]}>{id}</Text>
            </View>
            <View style={[styles.wrapper]}>
              <View style={styles.formGroup}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Nama produk</Text>
                <TextInput onChangeText={(text) => {
                  this.setState({
                    nama: text
                  })
                }} value={nama} style={[styles.formControl]} />
              </View>
              <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Harga beli produk</Text>
              <TextInput onChangeText={(text) => {
                const newText = parseInt(text.replace(/,/g, ''))
                this.setState({ modal: newText })
              }} value={numberFormat(modal)} keyboardType="numeric" style={[styles.formControl]}
              />
              <View style={styles.formGroup}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Harga jual produk</Text>
                <TextInput onChangeText={(text) => {
                  const newText = parseInt(text.replace(/,/g, ''))
                  this.setState({ harga: newText })
                }} value={numberFormat(harga)} keyboardType="numeric" style={[styles.formControl]} />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Diskon produk</Text>
                <TextInput onChangeText={(text) => {
                  const newText = parseInt(text.replace(/,/g, ''))
                  this.setState({ diskon: newText })
                }} value={numberFormat(diskon)} keyboardType="numeric" style={[styles.formControl]} />
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity onPress={() => {
            if (nama !== '') {
              this.simpan()
            } else {
              ToastAndroid.show('Masukkan nama produk', ToastAndroid.SHORT)
            }
          }} style={[styles.btn, styles.btnLg, styles.btnPrimary, { borderRadius: 0, paddingVertical: 15 }]}>
            <Text style={[styles.fontBold, styles.textWhite, styles.textCenter]}>Simpan</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <AlertDialog />
      </View>
    )
  }
}

export default InfoProduk