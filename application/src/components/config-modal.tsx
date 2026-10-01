import { useState } from "react";

import { View, Modal, TouchableOpacity, Text, TextInput, ScrollView } from "react-native";

import Slider from "@react-native-community/slider";

import { SettingsIcon } from "lucide-react-native";

import { Key, useJoystick } from "../contexts/joystick";

export function ConfigModal() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        className="border border-white rounded-full p-2"
        onPress={() => { setModalVisible(true); }}
      >
        <SettingsIcon color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => { setModalVisible(false); }}
      >
        <ModalBody />
      </Modal>
    </View>
  );
}

function ModalBody() {
  const { save } = useJoystick();

  return (
    <View className="flex-1 p-8 bg-black">
      <ScrollView className="m-auto w-1/2">
        <RangeSection />
        <TrimSection />

        <TouchableOpacity onPress={() => { save(); }}>
          <Text className="px-4 py-2 bg-white text-center">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function TrimSection() {
  const { positionRange, trim, setTrim } = useJoystick();

  return (
    <View>
      <Text className="text-white text-center text-2xl font-bold">Trim</Text>

      <View className="my-4 gap-4">
        {Object.entries(trim).map(([k, v]) => (
          <View
            key={k}
            className="border border-white p-4 flex-row"
          >
            <Text className="text-white">{k}</Text>

            <Slider
              style={{ flex: 1 }}
              className="w-full"
              minimumValue={-positionRange[k as keyof typeof positionRange].max}
              maximumValue={positionRange[k as keyof typeof positionRange].max}
              step={1}
              value={v}
              onValueChange={(val) => setTrim(prev => ({ ...trim, [k]: val }))}
            />

            <Text className="text-white">{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RangeSection() {
  const { positionRange, setPositionRange } = useJoystick();

  return (
    <View>
      <Text className="text-white text-center text-2xl font-bold">Range</Text>

      <View className="my-4 gap-4">
        {Object.entries(positionRange).map(([k, v]) => (
          <View
            key={k}
            className="border border-white p-4 flex-row justify-between items-center"
          >
            <Text className="mr-4 text-white">{k}</Text>

            <TextInput
              className="border border-white px-4 py-2 text-white"
              inputMode="numeric"
              maxLength={5}
              value={v.min.toString()}
              onChangeText={(text) => {
                setPositionRange(prev => ({ ...prev, [k]: { ...prev[k as Key], min: parseInt(text) || 0 } }));
              }}
            />

            <TextInput
              className="border border-white px-4 py-2 text-white"
              inputMode="numeric"
              value={v.max.toString()}
              maxLength={5}
              onChangeText={(text) => {
                setPositionRange(prev => ({ ...prev, [k]: { ...prev[k as Key], max: parseInt(text) || 0 } }));
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
