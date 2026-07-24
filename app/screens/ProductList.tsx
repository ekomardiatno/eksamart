/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
  BackHandler,
  FlatList,
  Modal,
  TextInput,
  NativeEventSubscription,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/styles';

import Item from '../components/ItemProductList';
import { withSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Produk } from '../types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductList'>;
  route: RouteProp<RootStackParamList, 'ProductList'>;
  insets: EdgeInsets;
}

interface State {
  data: Produk[];
  search: string;
  refresh: boolean;
  kodeHapus: string;
  namaHapus: string;
  fade: Animated.Value;
  toTop: Animated.Value;
  alert: boolean;
}

class ProductList extends Component<Props, State> {
  backHandler: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      search: '',
      refresh: false,
      kodeHapus: '',
      namaHapus: '',
      fade: new Animated.Value(0),
      toTop: new Animated.Value(15),
      alert: false,
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._backHandler as any,
    );

    this._getData();
  }

  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
    if (this.props.route.params?.handleBack) {
      this.props.route.params.handleBack();
    }
  }

  _backHandler = () => {};

  _getData = async (finisher: ((state: any) => void) | null = null) => {
    let data: any = await AsyncStorage.getItem('produk');
    if (data != null) {
      if (typeof finisher === 'function') {
        finisher({
          data: JSON.parse(data),
        });
      } else {
        this.setState({
          data: JSON.parse(data),
        });
      }
    }
  };

  cariProduk = async (finisher: ((state: any) => void) | null = null) => {
    let data: any = await AsyncStorage.getItem('produk');
    if (this.state.search === '') {
      this._getData(finisher);
    } else {
      if (data != null) {
        data = JSON.parse(data);
        if (typeof finisher === 'function') {
          finisher({
            data: data
              .filter((d: any) => {
                return d.nama_produk.toLowerCase();
              })
              .indexOf(this.state.search.toLowerCase()),
          });
        } else {
          this.setState({
            data: data
              .filter((d: any) => {
                return d.nama_produk.toLowerCase();
              })
              .indexOf(this.state.search.toLowerCase()),
          });
        }
      }
    }
  };

  refreshGoBack = () => {
    if (this.state.search === '') {
      this._getData();
    } else {
      this.cariProduk();
    }
  };

  _onRefresh = () => {
    this.setState({
      refresh: true,
    });

    if (this.state.search === '') {
      this._getData();
      this.setState({
        refresh: false,
      });
    } else {
      this.cariProduk();
      this.setState({
        refresh: false,
      });
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

  closeAlert = (state: object = {}) => {
    this.fadeOut();
    this.toBottom();
    setTimeout(() => {
      this.setState({
        alert: false,
        ...state,
      });
    }, 250);
  };

  cobaHapus = (id: string, nama: string) => {
    this.setState({
      kodeHapus: id,
      namaHapus: nama,
      alert: true,
    });
  };

  hapus = async (id: string, finisher: (() => void) | null = null) => {
    let data: any = await AsyncStorage.getItem('produk');
    data = JSON.parse(data);
    data.map((item: any, index: any) => {
      if (item.id_produk === id) {
        data.splice(index, 1);
        AsyncStorage.setItem('produk', JSON.stringify(data), () => {
          if (typeof finisher === 'function') {
            finisher();
          }
        });
      }
    });
  };

  _keyExtractor = (item: Produk, _index: number): string => item.id_produk.toString();

  render() {
    const { fade, toTop } = this.state;

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
                  <Text style={[styles.h4, styles.fontReg]}>
                    Yakin ingin menghapus produk "{this.state.namaHapus}"?
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
                      this.hapus(this.state.kodeHapus, () => {
                        if (this.state.search === '') {
                          this._getData(this.closeAlert);
                        } else {
                          this.cariProduk(this.closeAlert);
                        }
                      });
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

    const JTron = () => {
      if (this.state.search !== '') {
        return (
          <View style={[styles.wrapper, styles.alignCenter]}>
            <Text
              style={[
                styles.textMuted,
                styles.fontReg,
                styles.h4,
                styles.textCenter,
                { marginBottom: 6 },
              ]}
            >
              Kata kunci pencarian:
            </Text>
            <Text
              style={[
                styles.fontBold,
                styles.textBlack,
                styles.h1,
                styles.textCenter,
              ]}
            >
              {this.state.search}
            </Text>
          </View>
        );
      } else {
        return null;
      }
    };

    return (
      <View style={[styles.container, { paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
            style={styles.headerBtnLeft}
          >
            <Icon
              style={[styles.headerBtnLeftText, styles.textDanger]}
              name="chevron-left"
            />
          </TouchableOpacity>
          <View
            style={{
              borderWidth: 1,
              flex: 1,
              borderColor: '#eee',
              height: 37,
              borderRadius: 4,
              overflow: 'hidden',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={[
                styles.alignCenter,
                styles.justifyCenter,
                { width: 35, height: 35 },
              ]}
            >
              <Icon size={20} name="search" />
            </View>
            <TextInput
              onChangeText={search => {
                this.setState({ search });
                this.cariProduk();
              }}
              value={this.state.search}
              placeholder="Cari produk"
              placeholderTextColor="#757575"
              style={[
                styles.fontReg,
                styles.textPrimary,
                {
                  height: 35,
                  paddingVertical: 0,
                  paddingHorizontal: 15,
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderColor: '#eee',
                  flex: 1,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Scan', {
                  onScannedCode: (code) => {
                    this.props.navigation.navigate('InfoProduk', {
                      id: code,
                      fromList: true,
                      refresh: this.refreshGoBack,
                    });
                  }
                })
              }}
              style={[
                styles.alignCenter,
                styles.justifyCenter,
                { width: 35, height: 35 },
              ]}
            >
              <Icon style={styles.textPrimary} size={20} name="maximize" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={this._onRefresh}
            />
          }
          ListHeaderComponent={<JTron />}
          data={this.state.data}
          keyExtractor={this._keyExtractor}
          ListEmptyComponent={
            <View style={[styles.wrapper, styles.alignCenter]}>
              <Text style={[styles.fontReg, styles.textMuted, styles.h4]}>
                Belum ada produk yang terdaftar.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Item
              key={item.id_produk}
              editProduk={() => {
                this.props.navigation.navigate('InfoProduk', {
                  id: item.id_produk,
                  fromList: true,
                  refresh: this.refreshGoBack,
                });
              }}
              tambahStok={() => {
                this.props.navigation.navigate('Stock', {
                  id: item.id_produk,
                  refresh: this.refreshGoBack,
                });
              }}
              kode={item.id_produk}
              hapusProduk={() => {
                this.cobaHapus(item.id_produk, item.nama_produk);
              }}
              nama={item.nama_produk}
              harga={item.harga_produk}
              diskon={item.diskon_produk}
              stok={item.stok_produk.toString()}
            />
          )}
        />
        <AlertDialog />
      </View>
    );
  }
}

export default withSafeAreaInsets<Omit<Props, 'insets'>>(ProductList);
