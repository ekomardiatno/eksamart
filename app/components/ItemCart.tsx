import { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import numberFormat from '../helpers/numberFormat'
import styles from './styles'

interface Props {
  nama: string;
  qty: number;
  diskon: boolean;
  hargaAwal: number;
  hargaAkhir: number;
  fTambah: () => void;
  fKurang: () => void;
  fHapus?: () => void;
}

class ItemCart extends Component<Props> {
  render() {
    const { nama, qty, diskon, hargaAwal, hargaAkhir, fTambah, fKurang } = this.props
    const HargaAwal = () => {
      if (diskon) {
        return (
          <Text style={[styles.fontReg, styles.textMuted, { textDecorationLine: 'line-through', paddingLeft: 5 }]}>{numberFormat(hargaAwal)}</Text>
        )
      } else {
        return null
      }
    }
    return (
      <View style={{ backgroundColor: '#fff' }}>
        <View style={{ padding: 20, paddingVertical: 10 }}>
          <Text style={[styles.fontBold, styles.textBlack, styles.h3, { marginBottom: 6 }]}>{nama}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.fontReg, styles.textBlack, styles.textRight, styles.fontBold]}>{numberFormat(hargaAkhir)}</Text>
              <HargaAwal />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={fKurang} style={[styles.alignCenter, styles.justifyCenter, { width: 30, height: 30, borderWidth: 1, borderColor: '#eee', borderRadius: 30 / 2 }]}>
                <Icon name="minus" />
              </TouchableOpacity>
              <View style={[styles.alignCenter, styles.justifyCenter, { height: 30, paddingHorizontal: 10 }]}>
                <Text style={[styles.fontReg]}>{numberFormat(qty)}</Text>
              </View>
              <TouchableOpacity onPress={fTambah} style={[styles.alignCenter, styles.justifyCenter, { width: 30, height: 30, borderWidth: 1, borderColor: '#eee', borderRadius: 30 / 2 }]}>
                <Icon name="plus" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default ItemCart
