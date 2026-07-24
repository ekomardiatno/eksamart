import { Component } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Animated,
  BackHandler, Modal,
  NativeEventSubscription,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import numberFormat from '../helpers/numberFormat';
import { withSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from '../components/styles';



interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Stock'>;
  route: RouteProp<RootStackParamList, 'Stock'>;
  insets: EdgeInsets;
}

interface State {
  kode: string;
  nama: string;
  stok: number;
  stok_baru: number;
  alertBody: string;
  alert: boolean;
  fade: Animated.Value;
  toTop: Animated.Value;
}

class Stock extends Component<Props, State> {
  backHandler: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
    this.state = {
      kode: '',
      nama: '',
      stok: 0,
      stok_baru: 0,
      alertBody: '',
      alert: false,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15),
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._backHandler,
    );
    let id = this.props.route.params.id;
    this.setState({
      kode: id,
    });
    this._getData();
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
    if (this.props.route.params.refresh) {
      this.props.route.params.refresh();
    }
  }

  _backHandler = (): boolean => { return false; };

  _getData = async () => {
    let raw = await AsyncStorage.getItem('produk');
    let data: any[] = JSON.parse(raw as string);
    let item = data.filter((d: any) => {
      return d.id_produk === this.props.route.params.id;
    })[0];
    this.setState({
      kode: item.id_produk,
      nama: item.nama_produk,
      stok: item.stok_produk,
    });
  };

  _save = async () => {
    let raw = await AsyncStorage.getItem('produk');
    let data: any[] = JSON.parse(raw as string);
    let index = data
      .map((d: any) => {
        return d.id_produk;
      })
      .indexOf(this.state.kode);
    data[index].stok_produk = this.state.stok_baru + data[index].stok_produk;
    AsyncStorage.setItem('produk', JSON.stringify(data), error => {
      if (!error) {
        this.setState(
          {
            alert: true,
            alertBody: 'Stok berhasil diperbarui.',
            stok: data[index].stok_produk,
            stok_baru: 0,
          },
          () => {
            this.fadeIn();
            this.toTop();
          },
        );
      }
    });
  };

  fadeIn = () => {
    Animated.timing(this.state.fade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  fadeOut = () => {
    Animated.timing(this.state.fade, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  toTop = () => {
    Animated.timing(this.state.toTop, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  toBottom = () => {
    Animated.timing(this.state.toTop, {
      toValue: 15,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  closeAlert = () => {
    this.fadeOut();
    this.toBottom();
    setTimeout(() => {
      this.setState({
        alert: false,
      });
    }, 250);
  };

  render() {
    const { nama, kode, stok, stok_baru, fade, toTop, alertBody } = this.state;
    const AlertDialog = () => {
      return (
        <Modal
          visible={this.state.alert}
          statusBarTranslucent={true}
          onRequestClose={this.closeAlert}
          transparent={true}
          onShow={() => {
            this.fadeIn();
            this.toTop();
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,.25)',
              justifyContent: 'center',
              opacity: fade,
            }}
          >
            <View style={{ padding: 20 }}>
              <Animated.View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 3,
                  transform: [{ translateY: toTop }],
                }}
              >
                <View style={{ padding: 15 }}>
                  <Text style={[styles.h4, styles.fontReg]}>{alertBody}</Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 15,
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.closeAlert();
                    }}
                  >
                    <Text
                      style={{
                        ...styles.btn,
                        ...styles.btnPrimary,
                        ...styles.textWhite,
                        marginHorizontal: 5,
                      }}
                    >
                      {'Tutup'.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Modal>
      );
    };
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: this.props.insets.top,
            paddingBottom: this.props.insets.bottom,
          },
        ]}
      >
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
              this.props.route.params.refresh();
            }}
            style={styles.headerBtnLeft}
          >
            <Icon
              style={[styles.headerBtnLeftText, styles.textDanger]}
              name="chevron-left"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Stok Produk</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} enabled>
          <ScrollView style={styles.main}>
            <View style={[styles.wrapper, styles.alignCenter]}>
              <Text
                style={[
                  styles.textMuted,
                  styles.fontReg,
                  styles.h4,
                  { marginBottom: 6, textAlign: 'center' },
                ]}
              >
                {kode}
              </Text>
              <Text
                style={[
                  styles.fontBold,
                  styles.textBlack,
                  styles.h1,
                  { textAlign: 'center' },
                ]}
              >
                {nama}
              </Text>
            </View>
            <View style={[styles.wrapper]}>
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.fontReg,
                    styles.textMuted,
                    { marginBottom: 5 },
                  ]}
                >
                  Stok saat ini
                </Text>
                <TextInput
                  editable={false}
                  value={numberFormat(stok)}
                  style={[styles.formControl, styles.formGrey]}
                />
              </View>
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.fontReg,
                    styles.textMuted,
                    { marginBottom: 5 },
                  ]}
                >
                  Tambah Stok
                </Text>
                <View
                  style={[
                    styles.formControl,
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingHorizontal: 0,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        stok_baru: this.state.stok_baru - 1,
                      });
                    }}
                    style={[
                      styles.alignCenter,
                      styles.justifyCenter,
                      { height: 45, width: 40 },
                    ]}
                  >
                    <Icon name="minus" />
                  </TouchableOpacity>
                  <TextInput
                    onChangeText={(stok_baru_str: string) => {
                      const stok_baru = parseInt(stok_baru_str.replace(/,/g, ''));
                      this.setState({ stok_baru });
                    }}
                    keyboardType="numeric"
                    value={numberFormat(stok_baru)}
                    style={[
                      styles.fontReg,
                      styles.textBlack,
                      styles.textCenter,
                      { height: 45, paddingHorizontal: 10, flex: 1 },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        stok_baru: this.state.stok_baru + 1,
                      });
                    }}
                    style={[
                      styles.alignCenter,
                      styles.justifyCenter,
                      { height: 45, width: 40 },
                    ]}
                  >
                    <Icon name="plus" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              this._save();
            }}
            style={[
              styles.btn,
              styles.btnLg,
              styles.btnPrimary,
              { borderRadius: 0, paddingVertical: 15 },
            ]}
          >
            <Text
              style={[styles.fontBold, styles.textWhite, styles.textCenter]}
            >
              Simpan
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <AlertDialog />
      </View>
    );
  }
}

export default withSafeAreaInsets<Omit<Props, 'insets'>>(Stock);
