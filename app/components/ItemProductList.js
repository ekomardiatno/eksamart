/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import Icon from '@react-native-vector-icons/feather'
import numberFormat from '../helpers/numberFormat'

const styles = require('./styles')

class ItemProductList extends Component {
  render() {
    let { nama, harga, diskon, stok, tambahStok, editProduk, hapusProduk } = this.props

    const Aksi = () => {
      return (
        <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 80 }]}>
          <TouchableOpacity onPress={editProduk} style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20 }]}>
            <Icon style={styles.textWarning} size={18} name="edit" />
          </TouchableOpacity>
          <TouchableOpacity onPress={hapusProduk} style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20 }]}>
            <Icon style={styles.textDanger} size={18} name="trash-2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={tambahStok} style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20 }]}>
            <Icon style={styles.textPrimary} size={18} name="plus" />
          </TouchableOpacity>
        </View>
      )
    }

    const HargaAwal = () => {
      if (diskon > 0) {
        return (
          <Text style={[styles.fontReg, styles.textMuted, { textDecorationLine: 'line-through', paddingLeft: 5 }]}>{numberFormat(harga)}</Text>
        )
      } else {
        return null
      }
    }
    return (
      <View style={{ paddingVertical: 10, marginBottom: 1, paddingHorizontal: 20, backgroundColor: '#fff' }}>
        <Text style={[styles.h3, styles.fontBold, styles.textBlack, { marginBottom: 5 }]}>{nama}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 }}>
          <Text style={[styles.fontReg, styles.textBlack, styles.textRight, {fontWeight: 'bold'}]}>{numberFormat(harga - (diskon / 100 * harga))}</Text>
          <HargaAwal />
        </View>
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={[styles.fontReg, {}]}>Stok: {numberFormat(stok)}</Text>
          <Aksi />
        </View>
      </View>
    )
  }
}

export default ItemProductList