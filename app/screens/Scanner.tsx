/* eslint-disable react-native/no-inline-styles */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useCameraPermission,
  Camera,
  useCameraDevice,
  useCodeScanner,
  Code,
  useCameraFormat,
  Point,
} from 'react-native-vision-camera';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import styles from '../components/styles';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppNavigation from '../hooks/useAppNavigation';
import useAppRoute from '../hooks/useAppRoute';
const { width, height } = Dimensions.get('window');

function Scanner() {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState<boolean>(false);
  const frame = useSafeAreaFrame();
  const route = useAppRoute<'Scan'>();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if(hasPermission) {
      setIsActive(true)
      return () => {
        setIsActive(false)
      }
    }
  }, [hasPermission])

  const scanBoxSize = 250;
  const scanBoxX = (width - scanBoxSize) / 2;
  const scanBoxY = (height - scanBoxSize) / 2;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    regionOfInterest: {
      x: scanBoxX,
      y: scanBoxY,
      width: scanBoxSize,
      height: scanBoxSize,
    },
    onCodeScanned: codes => {
      for (const barcode of codes) {
        const { frame: bframe } = barcode;

        if (bframe) {
          const { x, y, width: bw, height: bh } = bframe;

          // ✅ check if barcode is inside scan box
          if (
            x >= scanBoxX &&
            y >= scanBoxY &&
            x + bw <= scanBoxX + scanBoxSize &&
            y + bh <= scanBoxY + scanBoxSize
          ) {
            runOnJS(onBarcodeDetected)(barcode);
          }
        }
      }
    },
  });

  const onBarcodeDetected = useCallback(
    (scannedCode: Code) => {
      navigation.goBack();
      route.params?.onScannedCode(scannedCode.value || '');
    },
    [navigation, route.params],
  );

  const format = useCameraFormat(device, [
    {
      photoHdr: true,
    },
  ]);

  const focus = useCallback((point: Point) => {
    const c = camera.current;
    if (c == null) return;
    console.log(c.focus);
    c.focus(point);
  }, []);

  const tap = Gesture.Tap().onEnd(({ x, y }) => {
    runOnJS(focus)({ x, y });
  });

  const requestCameraPermission = async () => {
    const resultPermission = await PermissionsAndroid.request(
      'android.permission.CAMERA',
    );
    if (resultPermission === 'never_ask_again') {
      Linking.openSettings();
    }
  };

  if (!hasPermission)
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        <View
          style={[
            styles.bgPrimary,
            { padding: 10, borderRadius: 3, marginBottom: 10 },
          ]}
        >
          <FontAwesome5
            iconStyle="solid"
            style={[styles.bigIcon, styles.textWhite]}
            name="camera"
          />
        </View>
        <Text
          style={[
            styles.textBlack,
            styles.fontBold,
            styles.h3,
            { marginBottom: 8 },
          ]}
        >
          No camera permission.
        </Text>
        <Text
          style={[
            styles.textMuted,
            styles.fontReg,
            styles.h4,
            styles.textCenter,
          ]}
        >
          Click the "granted" button to get permission to use the camera.
        </Text>
        <TouchableOpacity
          onPress={() => {
            requestCameraPermission();
          }}
          style={[styles.btn, styles.btnPrimary, { marginTop: 10 }]}
        >
          <Text style={[styles.fontBold, styles.textWhite]}>
            {'Granted'.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  if (!device)
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        <View
          style={[
            styles.bgPrimary,
            { padding: 10, borderRadius: 3, marginBottom: 10 },
          ]}
        >
          <FontAwesome5
            iconStyle="solid"
            style={[styles.bigIcon, styles.textWhite]}
            name="camera"
          />
        </View>
        <Text
          style={[
            styles.textBlack,
            styles.fontBold,
            styles.h3,
            { marginBottom: 8 },
          ]}
        >
          No camera available.
        </Text>
      </View>
    );
  return (
    <GestureDetector gesture={tap}>
      <View style={{ height: frame.height, position: 'relative' }}>
        <Camera
          ref={camera}
          device={device}
          codeScanner={codeScanner}
          style={{ flex: 1 }}
          isActive={isActive}
          format={format}
          photoHdr={format?.supportsPhotoHdr}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: (frame.height - scanBoxSize) / 2,
              backgroundColor: 'rgba(0,0,0,.75)',
              paddingTop: insets.top
            }}
          >
            <View style={[styles.header, {backgroundColor: 'transparent'}]}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
                style={styles.headerBtnLeft}
              >
                <FontAwesome5
                  iconStyle="solid"
                  style={[styles.headerBtnLeftText, styles.textDanger]}
                  name="chevron-left"
                />
              </TouchableOpacity>
              <Text
                style={[styles.title, { textAlignVertical: 'center', flex: 1 }]}
              >
                Pindai Produk
              </Text>
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: (frame.height - scanBoxSize) / 2,
              backgroundColor: 'rgba(0,0,0,.75)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: insets.bottom
            }}
          >
            <View>
              <View
                style={[
                  styles.alignCenter,
                  { flexWrap: 'wrap', marginBottom: 30, marginHorizontal: 20 },
                ]}
              >
                <Text
                  style={[
                    styles.fontBold,
                    styles.h1,
                    styles.textWhite,
                    { marginBottom: 10 },
                  ]}
                >
                  Pindai Produk
                </Text>
                <Text
                  style={[styles.fontReg, styles.textWhite, styles.textCenter]}
                >
                  Silakan pindai barcode produk lewat box diatas
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 15,
                  alignSelf: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('InputKode', {
                      params: {
                        handleBack: () => {
                          setIsActive(true);
                        },
                        onSubmitCode: (code: string) => {
                          navigation.goBack();
                          route.params?.onScannedCode(code);
                        },
                      },
                    });
                  }}
                  style={[
                    styles.btn,
                    styles.btnPrimary,
                    { marginHorizontal: 5 },
                  ]}
                >
                  <Text style={[styles.fontBold, styles.textWhite]}>
                    Masukkan Barcode
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: (frame.height - scanBoxSize) / 2,
              height: scanBoxSize,
              width: (frame.width - scanBoxSize) / 2,
              backgroundColor: 'rgba(0,0,0,.75)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: (frame.height - scanBoxSize) / 2,
              height: scanBoxSize,
              width: (frame.width - scanBoxSize) / 2,
              backgroundColor: 'rgba(0,0,0,.75)',
            }}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

export default Scanner;
