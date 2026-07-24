/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity, ScrollView
} from 'react-native';
import styles from '../components/styles';
import numberFormat from '../helpers/numberFormat';
import Icon from '@react-native-vector-icons/feather';
import dateFormat from '../helpers/dateFormat';
import ViewShot from 'react-native-view-shot';
import {
  checkMultiple,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import RNFS from 'react-native-fs';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import { withSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Transaksi, Penjualan, Toko } from '../types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Struk'>;
  route: RouteProp<RootStackParamList, 'Struk'>;
  insets: EdgeInsets;
}

interface State {
  transaksi: Transaksi | null;
  penjualan: Penjualan[];
  toko: Toko | null;
  readStorage: string;
  writeStorage: string;
  saved: boolean;
  path: string;
}

class Struk extends Component<Props, State> {
  _viewShot = React.createRef<any>();
  constructor(props: Props) {
    super(props);
    this.state = {
      transaksi: null,
      penjualan: [],
      toko: null,
      readStorage: RESULTS.UNAVAILABLE,
      writeStorage: RESULTS.UNAVAILABLE,
      saved: false,
      path: RNFS.ExternalStorageDirectoryPath + '/EksaMart/Struk/',
    };
  }

  componentDidMount() {
    // this._getData(() => {
    //   this._readPermission(() => {
    //     this._mkdir(() => {
    //       this._isSaved()
    //     })
    //   })
    // })
    this._getData();
  }

  _mkdir = (finisher: (() => void) | null = null) => {
    RNFS.exists(this.state.path).then(status => {
      if (!status) {
        RNFS.mkdir(this.state.path).then(_res => {
          if (typeof finisher === 'function') {
            finisher();
          }
        });
      } else {
        if (typeof finisher === 'function') {
          finisher();
        }
      }
    });
  };

  _isSaved = () => {
    RNFS.exists(
      this.state.path + this.props.route.params.id_transaksi + '.jpg',
    ).then(res => {
      this.setState(
        {
          saved: res,
        },
        () => {
          if (!this.state.saved) {
            this._captureView();
          }
        },
      );
    });
  };

  _readPermission = (finisher: (() => void) | null = null) => {
    let permissions = [
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ];
    checkMultiple(permissions).then(status => {
      for (let i = 0; i < permissions.length; i++) {
        if (status[permissions[i]] === RESULTS.GRANTED) {
          permissions.splice(i, 1);
        }
      }
      if (permissions.length > 0) {
        requestMultiple(permissions).then(_status => {
          if (typeof finisher === 'function') {
            finisher();
          }
        });
      } else if (typeof finisher === 'function') {
        finisher();
      }
    });
  };

  _getData = async (finisher: (() => void) | null = null) => {
    const transaksi = await AsyncStorage.getItem('transaksi');
    const penjualan = await AsyncStorage.getItem('penjualan');
    const toko = await AsyncStorage.getItem('toko');
    this.setState(
      {
        transaksi:
          transaksi !== null
            ? JSON.parse(transaksi).filter((t: any) => {
                return t.id_transaksi === this.props.route.params.id_transaksi;
              })[0]
            : null,
        penjualan:
          penjualan !== null
            ? JSON.parse(penjualan).filter((t: any) => {
                return t.id_transaksi === this.props.route.params.id_transaksi;
              })
            : [],
        toko: toko !== null ? JSON.parse(toko) : null,
      },
      () => {
        if (typeof finisher === 'function') {
          finisher();
        }
      },
    );
  };

  componentWillUnmount() {
    if (this.props.route.params?.handleBack) {
      this.props.route.params.handleBack();
    }
  }

  _captureView = () => {
    this._viewShot.current.capture().then((uri: any) => {
      console.log('do something with ', uri);
      RNFS.readFile(uri, 'base64').then(res => {
        RNFS.writeFile(
          this.state.path + this.props.route.params.id_transaksi + '.jpg',
          res,
          'base64',
        ).then(_res => {
          this._isSaved();
        });
      });
    });
  };

  _onShare = async () => {
    try {
      let uri = await this._viewShot.current.capture();
      const shareOptions = {
        title: 'Bagikan struk',
        url: uri,
        failOnCancel: false,
      };

      console.log(shareOptions);

      try {
        const ShareResponse = await Share.open(shareOptions);
        console.log(ShareResponse);
      } catch (error) {
        console.log('Error =>', error);
      }
    } catch (e) {
      console.log('Error =>', e);
    }
  };

  render() {
    const { id_transaksi } = this.props.route.params;
    const { toko, transaksi, penjualan } = this.state;
    return (
      <View style={{ ...styles.container, paddingTop: this.props.insets.top, paddingBottom: this.props.insets.bottom }}>
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
          <Text
            style={[styles.title, { textAlignVertical: 'center', flex: 1 }]}
          >
            Struk Belanja
          </Text>
          <TouchableOpacity
            onPress={() => {
              this._onShare();
            }}
            style={{ ...styles.headerBtnRight, marginRight: -8 }}
          >
            <Icon
              style={[
                styles.headerBtnRightText,
                toko !== null && transaksi !== null && penjualan.length > 0
                  ? styles.textPrimary
                  : styles.textMuted,
                { fontSize: 15 },
              ]}
              name="share-2"
            />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <ViewShot
            ref={this._viewShot}
            options={{ format: 'jpg', quality: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 15,
              marginTop: -15,
              ...styles.bgLight,
            }}
          >
            {toko !== null && (
              <View
                style={{
                  paddingBottom: 15,
                  borderBottomWidth: 1,
                  borderColor: '#eee',
                }}
              >
                <Text
                  style={{
                    ...styles.h3,
                    ...styles.textCenter,
                    marginBottom: 5,
                  }}
                >
                  {toko.nama_toko}
                </Text>
                <Text
                  style={{
                    ...styles.textCenter,
                    fontSize: 13,
                    ...styles.textMuted,
                  }}
                >
                  {toko.alamat_toko}
                </Text>
              </View>
            )}
            {transaksi !== null && (
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#eee',
                  marginBottom: 15,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 5
                }}
              >
                <View>
                  <View style={{ marginBottom: 5 }}>
                    <Text
                      style={[
                        styles.textMuted,
                        styles.fontReg,
                        { marginBottom: 3, fontSize: 13 },
                      ]}
                    >
                      Kode Transaksi
                    </Text>
                    <Text
                      style={[styles.fontBold, styles.textBlack, styles.h4]}
                    >
                      {id_transaksi}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.textMuted,
                        styles.fontReg,
                        { marginBottom: 3, fontSize: 13 },
                      ]}
                    >
                      Tanggal Transaksi
                    </Text>
                    <Text
                      style={[styles.fontBold, styles.textBlack, styles.h4]}
                    >
                      {dateFormat(transaksi.tanggal)}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <QRCode
                    value={this.props.route.params.id_transaksi.toString()}
                    size={80}
                  />
                </View>
              </View>
            )}
            <View style={{ marginBottom: 10 }}>
              {penjualan.map((d, i) => {
                return (
                  <View key={i} style={{ marginBottom: 5 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginHorizontal: -2,
                        alignItems: 'flex-end',
                      }}
                    >
                      <Text
                        style={[
                          styles.fontBold,
                          styles.textBlack,
                          { flex: 1, marginHorizontal: 2 },
                        ]}
                      >
                        {d.nama_produk}
                      </Text>
                      <Text
                        style={[
                          styles.fontReg,
                          styles.textMuted,
                          {
                            width: 30,
                            textAlign: 'center',
                            marginHorizontal: 2,
                          },
                        ]}
                      >
                        {numberFormat(d.qty)}
                      </Text>
                      <Text
                        style={[
                          styles.fontReg,
                          styles.textMuted,
                          {
                            textAlign: 'right',
                            width: 70,
                            marginHorizontal: 2,
                          },
                        ]}
                      >
                        {numberFormat(d.harga_produk)}
                      </Text>
                      <Text
                        style={[
                          styles.textBlack,
                          {
                            textAlign: 'right',
                            width: 70,
                            marginHorizontal: 2,
                          },
                        ]}
                      >
                        {numberFormat(d.harga_produk * d.qty)}
                      </Text>
                    </View>
                    {d.diskon_produk * 100 > 0 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text>Disc.</Text>
                        <Text style={{ ...styles.textRight }}>
                          {numberFormat(
                            d.harga_produk *
                              (d.diskon_produk / 100) *
                              d.qty *
                              -1,
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {transaksi !== null && (
              <View>
                <View
                  style={{
                    paddingVertical: 10,
                    borderTopWidth: 1,
                    borderColor: '#eee',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 5,
                      marginHorizontal: -2,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.textMuted,
                        flex: 1,
                        marginHorizontal: 2,
                      }}
                    >
                      Total Item
                    </Text>
                    <Text
                      style={[
                        styles.fontReg,
                        { width: 30, textAlign: 'center', marginHorizontal: 2 },
                      ]}
                    >
                      {numberFormat(
                        penjualan.reduce((total, a) => {
                          return total + a.qty;
                        }, 0),
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.fontReg,
                        { textAlign: 'right', width: 144, marginHorizontal: 2 },
                      ]}
                    >
                      {numberFormat(transaksi.total_awal)}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ ...styles.textMuted }}>Total Disc.</Text>
                    <Text>
                      {numberFormat(transaksi.total - transaksi.total_awal)}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ ...styles.textMuted }}>Total Belanja</Text>
                    <Text style={{ ...styles.fontBold }}>
                      {numberFormat(transaksi.total)}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ ...styles.textMuted }}>Tunai</Text>
                    <Text>{numberFormat(transaksi.bayar)}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Text style={{ ...styles.textMuted }}>Kembalian</Text>
                    <Text>
                      {numberFormat(transaksi.bayar - transaksi.total)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ViewShot>
        </ScrollView>
      </View>
    );
  }
}

export default withSafeAreaInsets<Omit<Props, 'insets'>>(Struk)
