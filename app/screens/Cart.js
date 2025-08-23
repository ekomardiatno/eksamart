/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  BackHandler,
  Animated,
  RefreshControl,
  Modal,
  ToastAndroid,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = require('../components/styles');
const { height, width } = Dimensions.get('window');

import Item from '../components/ItemCart';
import numberFormat from '../helpers/numberFormat';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

class Cart extends Component {
  backHandler;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      produk: [],
      produkHapus: null,
      idProdukHapus: null,
      alertHapus: false,
      alertSuccess: false,
      fade: new Animated.Value(0),
      toTop: new Animated.Value(0),
      refresh: false,
    };
  }

  componentDidMount() {
    this._getCart();
    this._produk();
  }

  handleGoBack = () => {
    this._getCart(cart => {
      if (cart === null) {
        this.setState({
          alertSuccess: true,
        });
      }
    });
  };

  _onRefresh = () => {
    this.setState(
      {
        refresh: true,
      },
      () => {
        this._getCart(cart => {
          this.setState({
            refresh: false,
          });
        });
      },
    );
  };

  _getCart = async (finisher = null) => {
    let cart = await AsyncStorage.getItem('keranjang');
    if (cart !== null) {
      this.setState(
        {
          data: JSON.parse(cart),
        },
        () => {
          if (typeof finisher === 'function') {
            finisher(cart);
          }
        },
      );
    } else {
      this.setState(
        {
          data: [],
        },
        () => {
          if (typeof finisher === 'function') {
            finisher(cart);
          }
        },
      );
    }
  };

  _produk = async (finisher = null) => {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._backHandler,
    );
    let produk = await AsyncStorage.getItem('produk');
    if (produk != null) {
      this.setState(
        {
          produk: JSON.parse(produk),
        },
        () => {
          if (typeof finisher === 'function') {
            finisher();
          }
        },
      );
    }
  };

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
    if (this.props.route.params.handleBack) {
      this.props.route.params.handleBack();
    }
  }

  _backHandler = () => {};

  plusQty = async id => {
    let produk = await AsyncStorage.getItem('produk');
    produk = produk ? JSON.parse(produk) : [];
    let produkIndex = produk
      .map(p => {
        return p.id_produk;
      })
      .indexOf(id);
    if (produk[produkIndex].stok_produk <= 0) {
      ToastAndroid.show('Stok produk habis', ToastAndroid.SHORT);
    } else {
      let data = this.state.data;
      let dataIndex = data
        .map(d => {
          return d.id_produk;
        })
        .indexOf(id);
      data[dataIndex].qty += 1;
      produk[produkIndex].stok_produk -= 1;
      await AsyncStorage.setItem('keranjang', JSON.stringify(data));
      await AsyncStorage.setItem('produk', JSON.stringify(produk));
      this.setState({ produk, data });
    }
  };

  minQty = async (id, name) => {
    let data = await AsyncStorage.getItem('keranjang');
    data = data ? JSON.parse(data) : [];
    let dataIndex = data
      .map(d => {
        return d.id_produk;
      })
      .indexOf(id);
    if (data[dataIndex].qty <= 1) {
      this.cobaHapusCart(id, name);
    } else {
      data[dataIndex].qty -= 1;
      let produk = this.state.produk;
      let produkIndex = produk
        .map(p => {
          return p.id_produk;
        })
        .indexOf(id);
      produk[produkIndex].stok_produk += 1;
      await AsyncStorage.setItem('keranjang', JSON.stringify(data));
      await AsyncStorage.setItem('produk', JSON.stringify(produk));
      this.setState({ produk, data });
    }
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

  closeAlert = (state = {}) => {
    this.fadeOut();
    this.toBottom();
    setTimeout(() => {
      this.setState({
        alertHapus: false,
        alertSuccess: false,
        ...state,
      });
    }, 250);
  };

  cobaHapusCart = (id, nama) => {
    this.setState({
      idProdukHapus: id,
      produkHapus: nama,
      alertHapus: true,
    });
  };

  hapusCart = async (finisher = null) => {
    let data = await AsyncStorage.getItem('keranjang');
    data = data ? JSON.parse(data) : [];
    let dataIndex = data
      .map(d => {
        return d.id_produk;
      })
      .indexOf(this.state.idProdukHapus);
    let produk = this.state.produk;
    let produkIndex = produk
      .map(d => {
        return d.id_produk;
      })
      .indexOf(this.state.idProdukHapus);
    produk[produkIndex].stok_produk += data[dataIndex].qty;
    data = data.slice(dataIndex, 1);
    await AsyncStorage.setItem('keranjang', JSON.stringify(data));
    await AsyncStorage.setItem('produk', JSON.stringify(produk));
    if (typeof finisher === 'function') {
      finisher({
        produk: produk,
      });
    } else {
      this.setState({ produk });
    }
  };

  _handleAddToCart = async code => {
    let produk = await AsyncStorage.getItem('produk');
    if (produk !== null) {
      produk = JSON.parse(produk);
      const p = produk.find(p => p.id_produk === code);
      const items = await AsyncStorage.getItem('keranjang');
      const parsedItems = items ? JSON.parse(items) : [];
      if (!p) {
        Alert.alert(
          null,
          'Produk tidak ditemukan/belum tercatat. Silakan Coba Lagi.',
        );
        return;
      }
      if (p.stok_produk < 1) {
        Alert.alert(null, 'Stok produk habis!');
        return;
      }
      const findItemByCode = parsedItems.find(r => r.id_produk === code);
      let data = [];
      if (findItemByCode) {
        const newItems = parsedItems.map(r => {
          if (r.id_produk === code) {
            return {
              ...r,
              qty: r.qty + 1,
            };
          }
          return r;
        });
        data = newItems;
        await AsyncStorage.setItem('keranjang', JSON.stringify(newItems));
      } else {
        data = [
          {
            id_produk: code,
            qty: 1,
          },
        ];
        await AsyncStorage.setItem('keranjang', JSON.stringify(data));
      }
      const newProducts = produk.map(r => {
        if (r.id_produk === code) {
          return {
            ...r,
            stok_produk: r.stok_produk - 1,
          };
        }
        return r;
      });
      await AsyncStorage.setItem('produk', JSON.stringify(newProducts));
      this.setState({ produk: newProducts, data });
    } else {
      Alert.alert(null, 'Belum ada produk yang terdaftar!');
    }
  };

  render() {
    const navigation = this.props.navigation;
    let { data, produk, fade, toTop } = this.state;

    const AlertHapus = () => {
      return (
        <Modal
          visible={this.state.alertHapus}
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
                  <Text style={[styles.h4, styles.fontReg]}>
                    Yakin ingin menghapus produk "{this.state.produkHapus}"?
                  </Text>
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
                    <Text style={{ ...styles.btn, marginHorizontal: 5 }}>
                      {'Batal'.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.hapusCart(this.closeAlert);
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
                      {'Hapus'.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Modal>
      );
    };

    const AlertSuccess = () => {
      return (
        <Modal
          visible={this.state.alertSuccess}
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
                  <Text style={[styles.h4, styles.fontReg]}>
                    Transaksi berhasil.
                  </Text>
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

    const ItemCart = () => {
      if (data.length > 0 && produk.length > 0) {
        return (
          <View>
            {data.map((item, index) => {
              let produkN = produk.filter(p => {
                return p.id_produk === item.id_produk;
              })[0];
              return (
                <Item
                  fTambah={() => {
                    this.plusQty(item.id_produk);
                  }}
                  fKurang={() => {
                    this.minQty(item.id_produk, produkN.nama_produk);
                  }}
                  key={index}
                  nama={produkN.nama_produk}
                  qty={item.qty}
                  diskon={produkN.diskon_produk > 0}
                  hargaAwal={produkN.harga_produk * item.qty}
                  hargaAkhir={
                    (produkN.harga_produk -
                      (produkN.diskon_produk / 100) * produkN.harga_produk) *
                    item.qty
                  }
                />
              );
            })}
          </View>
        );
      } else {
        return (
          <View style={[styles.wrapper, styles.alignCenter]}>
            <Text style={[styles.textMuted, styles.fontReg, styles.h4]}>
              Belum ada transaksi
            </Text>
          </View>
        );
      }
    };

    const TotalHarga = () => {
      let total = 0;
      if (data.length > 0 && produk.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let produk1 = produk.filter(p => {
            return p.id_produk === data[i].id_produk;
          })[0];
          total +=
            (produk1.harga_produk -
              (produk1.diskon_produk / 100) * produk1.harga_produk) *
            data[i].qty;
        }
      }
      return (
        <Text style={[styles.fontBold, styles.textSuccess, styles.h2]}>
          {numberFormat(total)}
        </Text>
      );
    };

    const BtnPay = () => {
      if (this.state.data.length > 0) {
        return (
          <TouchableOpacity
            onPress={() => {
              let total = 0;
              for (let i = 0; i < this.state.data.length; i++) {
                let produk = this.state.produk.filter(p => {
                  return p.id_produk === this.state.data[i].id_produk;
                })[0];
                total +=
                  (produk.harga_produk -
                    (produk.diskon_produk / 100) * produk.harga_produk) *
                  this.state.data[i].qty;
              }
              this.props.navigation.navigate('Pembayaran', {
                total: total,
                handleBack: this.handleGoBack,
              });
            }}
            style={[styles.btn, styles.btnPrimary]}
          >
            <Text style={[styles.fontBold, styles.textWhite]}>Bayar</Text>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity style={[styles.btn, styles.btnGrey]}>
            <Text style={[styles.fontBold, styles.textBlack]}>Bayar</Text>
          </TouchableOpacity>
        );
      }
    };

    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.headerBtnLeft}
          >
            <Icon
              style={[styles.headerBtnLeftText, styles.textDanger]}
              name="chevron-left"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Keranjang Belanjaan</Text>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._onRefresh}
            />
          }
          style={styles.main}
        >
          <ItemCart />
        </ScrollView>
        <View
          style={{
            padding: 15,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
          }}
        >
          <TotalHarga />
          <View style={[{ flexDirection: 'row' }]}>
            <BtnPay />
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Scan', {
                  onScannedCode: code => {
                    this._handleAddToCart(code).then(() => {
                      this._getCart();
                    });
                  },
                  handleBack: this._getCart,
                });
              }}
              style={[
                styles.btn,
                styles.btnWarning,
                { justifyContent: 'center', marginLeft: 8 },
              ]}
            >
              <Icon size={20} style={[styles.textBlack]} name="maximize" />
            </TouchableOpacity>
          </View>
        </View>
        <AlertHapus />
        <AlertSuccess />
      </View>
    );
  }
}

export default withSafeAreaInsets(Cart);
