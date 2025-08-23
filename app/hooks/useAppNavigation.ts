import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

const useAppNavigation = useNavigation<
  NativeStackNavigationProp<RootStackParamList>
>;

export default useAppNavigation