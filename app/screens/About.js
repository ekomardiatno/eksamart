import { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image
} from 'react-native'
import Icon from '@react-native-vector-icons/fontawesome5'
import Feather from '@react-native-vector-icons/feather'
import { withSafeAreaInsets } from 'react-native-safe-area-context'

const { width, height } = Dimensions.get('window')
const styles = require('../components/styles')

class About extends Component {
  render() {
    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            this.props.navigation.goBack()
          }} style={styles.headerBtnLeft}>
            <Feather style={[styles.headerBtnLeftText, styles.textDanger]} name="chevron-left" />
          </TouchableOpacity>
          <Text style={styles.title}>Tentang Aplikasi</Text>
        </View>
        <ScrollView style={styles.main}>
          <View style={[styles.alignCenter]}>
            <Image style={{ height: 100, width: 100, marginVertical: -10 }} source={require('../assets/images/EKSAMART.png')} />
            {/* <Text style={[styles.fontBold, styles.textGrey, styles.h3, { marginBottom: 15 }]}>EKSAMART</Text> */}
          </View>
          <View style={{ marginHorizontal: 20 }}>
            <View style={{ paddingVertical: 6 }}>
              <Text style={[styles.fontBold, styles.textBlack, { marginBottom: 4 }]}>{'Nama Pengembang'}</Text>
              <Text style={[styles.fontReg, styles.textMuted]}>Eko Mardiatno</Text>
            </View>
            <View style={{ paddingVertical: 6 }}>
              <Text style={[styles.fontBold, styles.textBlack, { marginBottom: 4 }]}>{'Kontak Pengembang'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 5 }}>
                <View style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20, marginLeft: -2 }]}><Icon iconStyle='solid' size={14} style={[styles.textWarning]} name="at" /></View>
                <Text style={[styles.fontReg, styles.textMuted, { paddingLeft: 5, width: width - 30 - 20 }]}>ekomardiatno@gmail.com</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 5 }}>
                <View style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20, marginLeft: -2 }]}><Icon iconStyle='brand' size={14} style={[styles.textDanger]} name="instagram-square" /></View>
                <Text style={[styles.fontReg, styles.textMuted, { paddingLeft: 5, width: width - 30 - 20 }]}>emfnc</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 5 }}>
                <View style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20, marginLeft: -2 }]}><Icon iconStyle='brand' size={14} style={[styles.textPrimary]} name="facebook-square" /></View>
                <Text style={[styles.fontReg, styles.textMuted, { paddingLeft: 5, width: width - 30 - 20 }]}>emrdtn</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 5 }}>
                <View style={[styles.alignCenter, styles.justifyCenter, { width: 20, height: 20, marginLeft: -2 }]}><Icon iconStyle='brand' size={14} style={[styles.textInfo]} name="twitter-square" /></View>
                <Text style={[styles.fontReg, styles.textMuted, { paddingLeft: 5, width: width - 30 - 20 }]}>ekomardiatno</Text>
              </View>
            </View>
            <View style={{ paddingVertical: 6 }}>
              <Text style={[styles.fontBold, styles.textBlack, { marginBottom: 4 }]}>{'Framework'}</Text>
              <Text style={[styles.fontReg, styles.textMuted]}>React Native</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default withSafeAreaInsets(About)