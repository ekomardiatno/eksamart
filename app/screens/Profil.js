import { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  BackHandler,
  Modal
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { withSafeAreaInsets } from 'react-native-safe-area-context'
const styles = require('../components/styles')
const { width, height } = Dimensions.get('window')
class TextArea extends Component {
  render() {
    return (
      <TextInput
        {...this.props}
        editable={true}
      />
    )
  }
}

class Profil extends Component {
  backHandler
  constructor(props) {
    super(props)
    this.state = {
      nama: null,
      alamat: null,
      pemilik: null,
      alert: false,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15),
      first: false,
      toko: null
    }
  }
  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    AsyncStorage.getItem('toko').then(rs => {
      if (rs != null) {
        rs = JSON.parse(rs)
        this.setState({
          nama: rs.nama_toko,
          alamat: rs.alamat_toko,
          pemilik: rs.pemilik_toko,
          toko: rs
        })
      } else {
        this.setState({
          first: true
        })
      }
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

  simpan = () => {
    let nama = this.state.nama,
      alamat = this.state.alamat,
      pemilik = this.state.pemilik,
      toko = this.state.toko

    if (toko != null) {
      toko.nama_toko = nama
      toko.alamat_toko = alamat
      toko.pemilik_toko = pemilik
      AsyncStorage.setItem('toko', JSON.stringify(toko))
    } else {
      let data = {
        'nama_toko': nama,
        'alamat_toko': alamat,
        'pemilik_toko': pemilik
      }

      AsyncStorage.setItem('toko', JSON.stringify(data))
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
  render() {
    const { fade, toTop } = this.state
    const Alert = () => {
      let body = ''
      if (this.state.first) {
        body = 'Profil berhasil disimpan.'
      } else {
        body = 'Profil diperbarui.'
      }
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
                  <Text style={[styles.h4, styles.fontReg]}>{body}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 15, justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => {
                    this.closeAlert()
                  }}><Text style={{ ...styles.btn, ...styles.btnPrimary, ...styles.textWhite, marginHorizontal: 5 }}>{'Tutup'.toUpperCase()}</Text></TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Modal>
      )
    }
    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Icon style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <Text style={styles.title}>Atur Profil Toko</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} enabled>
          <ScrollView style={styles.main}>
            <View style={[styles.wrapper]}>
              <View style={styles.formGroup}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Nama Toko</Text>
                <TextInput onChangeText={(nama) => {
                  this.setState({ nama })
                }} value={this.state.nama} style={[styles.formControl]} />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Pemilik Toko</Text>
                <TextInput onChangeText={(pemilik) => {
                  this.setState({ pemilik })
                }} value={this.state.pemilik} style={[styles.formControl]} />
              </View>
              <View style={[styles.formGroup]}>
                <Text style={[styles.fontReg, styles.textMuted, { marginBottom: 5 }]}>Alamat Toko</Text>
                <TextArea
                  multiline={true}
                  numberOfLines={4}
                  onChangeText={(alamat) => this.setState({ alamat })}
                  value={this.state.alamat}
                  style={[styles.fontReg, styles.textBlack, { width: '100%', height: 100, paddingVertical: 10, textAlignVertical: 'top', paddingHorizontal: 10, borderRadius: 3, borderWidth: 1, borderColor: '#eee' }]}
                  autoCorrect={false}
                />
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity onPress={() => {
            this.simpan()
            this.setState({
              alert: true
            })
          }} style={[styles.btn, styles.btnLg, styles.btnPrimary, { borderRadius: 0, paddingVertical: 15 }]}>
            <Text style={[styles.fontBold, styles.textWhite, styles.textCenter]}>Simpan</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <Alert />
      </View>
    )
  }
}

export default withSafeAreaInsets(Profil)