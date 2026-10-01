import { useEffect } from "react";

import { View } from "react-native";

import { useSerial } from "../contexts/serial";
import { JoystickProvider, useJoystick } from "../contexts/joystick";

import { Joystick } from "./joystick";
import { ConfigModal } from "./config-modal";


function encode(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return data;
}

export function JoystickWrapper() {
  return (
    <JoystickProvider>
      <JoystickWrapperBody />
    </JoystickProvider>
  );
}

export function JoystickWrapperBody() {
  const { position, positionRange, trim } = useJoystick();

  const { port } = useSerial();

  useEffect(() => {
    if (port?.isConnected()) {
      const interval = setInterval(() => {
        port.write(encode(`${position.current.lx},${position.current.ly},${position.current.rx},${position.current.ry}\n`));
      }, 20);

      return () => {
        clearInterval(interval);
        port.disconnect();
      };
    }
  }, [port]);

  return (
    <View className="p-8 flex-1 flex-row gap-4 items-center">
      <Joystick
        defaultPosition={{ x: 0, y: -100 }}
        resetPosition={{ x: 0 }}
        dutyCycleValueX={{ min: positionRange.lx.min, max: positionRange.lx.max }}
        dutyCycleValueY={{ min: positionRange.ly.min, max: positionRange.ly.max }}
        trim={{ x: trim.lx, y: trim.ly }}
        onUpdate={({ x, y }) => {
          position.current.lx = Math.round(x);
          position.current.ly = Math.round(y);
        }}
        onDeactivate={({ x, y }) => {
          position.current.lx = Math.round(x);
          position.current.ly = Math.round(y);
        }}
      />

      <ConfigModal />

      <Joystick
        resetPosition={{ x: 0, y: 0 }}
        dutyCycleValueX={{ min: positionRange.rx.min, max: positionRange.rx.max }}
        dutyCycleValueY={{ min: positionRange.ry.min, max: positionRange.ry.max }}
        trim={{ x: trim.rx, y: trim.ry }}
        onUpdate={({ x, y }) => {
          position.current.rx = Math.round(x);
          position.current.ry = Math.round(y);
        }}
        onDeactivate={({ x, y }) => {
          position.current.rx = Math.round(x);
          position.current.ry = Math.round(y);
        }}
      />
    </View>
  );
}
