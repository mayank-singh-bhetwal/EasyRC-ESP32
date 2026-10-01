import { View } from "react-native";

import { Home } from "./home";

export function AppContent() {
  return (
    <View className="bg-black flex-1">
      <Home />
    </View>
  );
}
