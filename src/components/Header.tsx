import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSAV } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const SafeAreaView = styled(RNSAV);

interface HeaderProps {
  onRefresh: () => void;
}

export function Header({ onRefresh }: HeaderProps) {
  return (
    <>
      <SafeAreaView className="w-full h-4/10 items-center">
        <Text className="text-4xl font-bold text-accent1">uTransit</Text>
      </SafeAreaView>

      <View className="bg-secondary flex-row w-9/10 h-18 gap-2 items-center sticky top-5 z-10 rounded-3xl p-4">
        <SymbolView
          name={"magnifyingglass"}
          tintColor={theme.light.background}
        />
        <Text className="text-background text-2xl flex-1">Where To</Text>

        <TouchableOpacity onPress={onRefresh}>
          <SymbolView name={"house"} tintColor={theme.light.background} />
        </TouchableOpacity>
      </View>
    </>
  );
}
