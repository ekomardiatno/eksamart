import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

function useAppRoute<T extends keyof RootStackParamList>() {
  return useRoute<
    RouteProp<RootStackParamList[T]>
  >()
}

export default useAppRoute