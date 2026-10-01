import "./global.css";

import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SerialProvider } from "./src/contexts/serial";

import { AppContent } from "./src/app-content";

export default function App() {
  return (
    <SafeAreaProvider>
      <SerialProvider>
        <GestureHandlerRootView>
          <StatusBar hidden={true} />
          <AppContent />
        </GestureHandlerRootView>
      </SerialProvider>
    </SafeAreaProvider>
  );
}
