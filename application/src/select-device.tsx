import { Text, TouchableOpacity, View } from "react-native";

import { useSerial } from "./contexts/serial";

export function SelectDevice() {
  const serial = useSerial();

  return (
    <View className="px-12 py-8 flex-1 gap-8">
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-2xl">Select Device</Text>

        <TouchableOpacity onPress={() => {
          try {
            serial.list();
          } catch (e) { }
        }}>
          <Text className="border border-white rounded-lg px-4 py-1 text-white">Refresh</Text>
        </TouchableOpacity>
      </View>

      <View className="border border-white rounded-lg p-4 gap-4 flex-1 flex-row flex-wrap justify-center items-center">
        {serial.devices.length === 0 ? (
          <Text className="text-white">No Device</Text>
        ) : (
          serial.devices.map(device => (
            <TouchableOpacity
              key={device.deviceName}
              className="border border-white rounded-lg p-2"
              onPress={() => { serial.connect(device.deviceName, 115200); }}
            >
              <Text className="text-white">{device.deviceName} - {device.deviceId}</Text>
            </TouchableOpacity>
          )))}
      </View>
    </View >
  );
}
