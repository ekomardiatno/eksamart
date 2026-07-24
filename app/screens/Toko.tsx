import { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView, Dimensions
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import numberFormat from '../helpers/numberFormat'
import { EdgeInsets, withSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../App'
import { Penjualan, Transaksi } from '../types'
import styles from '../components/styles'

const { height, width } = Dimensions.get('window')

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Toko'>
  route: RouteProp<RootStackParamList, 'Toko'>
  insets: EdgeInsets
}

type State = {
  profil: boolean
  nama: string
  alamat: string
  pemilik: string
  penjualan: Penjualan[]
  transaksi: Transaksi[]
  qtyLastMonth: number
  rpLastMonth: number
  tLastMonth: number
}

class Toko extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      profil: false,
      nama: '',
      alamat: '',
      pemilik: '',
      penjualan: [],
      transaksi: [],
      qtyLastMonth: 0,
      rpLastMonth: 0,
      tLastMonth: 0
    }
  }
  componentDidMount() {
    this._getData(() => {
      this._getTerjual()
    })
  }

  _getData = async (finisher: (() => void) | null = null) => {
    let penjualan = await AsyncStorage.getItem('penjualan'),
      transaksi = await AsyncStorage.getItem('transaksi'),
      toko = await AsyncStorage.getItem('toko')

    this.setState({
      penjualan: penjualan !== null ? JSON.parse(penjualan) : [],
      transaksi: transaksi !== null ? JSON.parse(transaksi) : [],
      profil: toko !== null ? true : false,
      nama: toko !== null ? JSON.parse(toko).nama_toko : '',
      alamat: toko !== null ? JSON.parse(toko).alamat_toko : '',
      pemilik: toko !== null ? JSON.parse(toko).pemilik_toko : ''
    }, () => {
      if(typeof finisher === 'function') {
        finisher()
      }
    })
  }

  _getTerjual = () => {
    let transaksi = this.state.transaksi,
      penjualan = this.state.penjualan,
      dt = new Date(),
      m = dt.getMonth()

    m = parseInt(m as unknown as string)

    let y = dt.getFullYear()

    m = m == 0 ? 12 : m
    y = m == 12 ? y - 1 : y

    m = ('0' + m).slice(-2) as unknown as number

    let qtyP = 0,
      rpP = 0

    transaksi = transaksi.filter(t => {
      return t.tanggal.indexOf(y + '-' + m) > -1
    })

    for(let i=0;i<transaksi.length;i++) {
      let penjualanN = penjualan.filter(p => {
        return p.id_transaksi === transaksi[i].id_transaksi
      })
      for(let j=0;j<penjualanN.length;j++) {
        qtyP += penjualanN[j].qty
        rpP += (penjualanN[j].harga_produk - penjualanN[j].modal_produk) * penjualanN[j].qty
      }
    }

    this.setState({
      qtyLastMonth: qtyP,
      rpLastMonth: rpP,
      tLastMonth: transaksi.length
    })

  }

  render() {
    const InfoToko = () => {
      return (
        <View style={[styles.wrapper]}>
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.textMuted, { marginBottom: 6, fontSize: 13 }]}>Nama toko</Text>
            <Text style={[styles.fontReg, styles.textBlack]}>{this.state.nama !== '' ? this.state.nama : '-'}</Text>
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.textMuted, { marginBottom: 6, fontSize: 13 }]}>Nama pemilik toko</Text>
            <Text style={[styles.fontReg, styles.textBlack]}>{this.state.pemilik !== '' ? this.state.pemilik : '-'}</Text>
          </View>
          <View>
            <Text style={[styles.textMuted, { marginBottom: 6, fontSize: 13 }]}>Alamat toko</Text>
            <Text style={[styles.fontReg, styles.textBlack]}>{this.state.alamat !== '' ? this.state.alamat : '-'}</Text>
          </View>
        </View>
      )
    }

    let { rpLastMonth, qtyLastMonth, tLastMonth } = this.state

    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <View style={[styles.header]}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Icon style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <Text style={styles.title}>Tentang toko</Text>
        </View>
        <View style={{ height: height - 50 }}>
          <ScrollView style={styles.main}>
            <View style={[styles.bgSuccess, { marginHorizontal: 20, borderRadius: 4, overflow: 'hidden', marginTop: 10 }]}>
              <View style={{ backgroundColor: 'rgba(0,0,0,.05)', padding: 15, paddingVertical: 10 }}>
                <Text style={[styles.fontReg, styles.textWhite]}>Penjualan bulan lalu</Text>
              </View>
              <View style={[styles.alignCenter, styles.justifyCenter, { flexDirection: 'row' }]}>
                <View style={[styles.alignCenter, { width: (width - 20) / 3, flexDirection: 'column', paddingHorizontal: 15, paddingVertical: 10 }]}>
                  <Text style={[styles.fontReg, styles.textWhite, { textAlign: 'center' }]}>Transaksi</Text>
                  <Text style={[styles.fontBold, styles.textWhite, { textAlign: 'center' }]}>{numberFormat(tLastMonth)}</Text>
                </View>
                <View style={[styles.alignCenter, { width: (width - 20) / 3, flexDirection: 'column', paddingHorizontal: 15, paddingVertical: 10 }]}>
                  <Text style={[styles.fontReg, styles.textWhite, { textAlign: 'center' }]}>Terjual</Text>
                  <Text style={[styles.fontBold, styles.textWhite, { textAlign: 'center' }]}>{numberFormat(qtyLastMonth)} pcs</Text>
                </View>
                <View style={[styles.alignCenter, { width: (width - 20) / 3, flexDirection: 'column', paddingHorizontal: 15, paddingVertical: 10 }]}>
                  <Text style={[styles.fontReg, styles.textWhite, { textAlign: 'center' }]}>Keuntungan</Text>
                  <Text style={[styles.fontBold, styles.textWhite, { textAlign: 'center' }]}>{numberFormat(rpLastMonth)}</Text>
                </View>
              </View>
            </View>
            <InfoToko />
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('Profil', {
                handleBack: this._getData
              })
            }} style={[{ backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20 }]}>
              <Text style={[styles.fontBold, styles.textPrimary]}>Atur Profil Toko</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('About')
            }} style={[{ backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20 }]}>
              <Text style={[styles.fontBold, styles.textPrimary]}>Tentang Aplikasi</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    )
  }
}

export default withSafeAreaInsets<Omit<Props, 'insets'>>(Toko)
