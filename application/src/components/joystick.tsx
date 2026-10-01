import { View } from "react-native";

import { GestureDetector, usePanGesture } from "react-native-gesture-handler";

import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { runOnJS } from "react-native-worklets";

type Coordinate = { x: number; y: number; };
type Position = Coordinate;
type onHandle = (pwmResolution: Coordinate) => void;

export function Joystick({
  defaultPosition = { x: 0, y: 0 },
  resetPosition,
  dutyCycleValueX = { min: 0, max: 1023 },
  dutyCycleValueY = { min: 0, max: 1023 },
  trim = { x: 0, y: 0 },
  onUpdate,
  onDeactivate
}: {
  defaultPosition?: Partial<Position>;
  resetPosition?: Partial<Position>;
  // resolutionSteps, dutyCycleValue(max), count(max)
  dutyCycleValueX?: { min: number; max: number; };
  dutyCycleValueY?: { min: number; max: number; };
  trim?: Position;
  onUpdate: onHandle;
  onDeactivate?: onHandle;
}) {
  const position = useSharedValue({ x: 0, y: 0 });
  const size = useSharedValue({ width: 0, height: 0 });

  const panGesture = usePanGesture({
    onUpdate: ({ x, y }) => {
      x = Math.max(Math.min(x, size.value.width), 0);
      y = Math.max(Math.min(y, size.value.height), 0);

      position.value = { x, y };

      let dcvX = interpolate(x, [0, size.value.width], [dutyCycleValueX.min, dutyCycleValueX.max]);
      let dcvY = interpolate(y, [size.value.height, 0], [dutyCycleValueY.min, dutyCycleValueY.max]);

      dcvX += trim.x;
      dcvY += trim.y;

      dcvX = Math.max(Math.min(dcvX, dutyCycleValueX.max), dutyCycleValueX.min);
      dcvY = Math.max(Math.min(dcvY, dutyCycleValueY.max), dutyCycleValueY.min);

      runOnJS(onUpdate)({ x: dcvX, y: dcvY });
    },
    onDeactivate: ({ x, y }) => {
      x = Math.max(Math.min(x, size.value.width), 0);
      y = Math.max(Math.min(y, size.value.height), 0);

      // Reset Position
      const p = { x, y };

      if (typeof resetPosition?.x === "number") { p.x = interpolate(resetPosition.x, [-100, 100], [0, size.value.width]); }
      if (typeof resetPosition?.y === "number") { p.y = interpolate(resetPosition.y, [100, -100], [0, size.value.height]); }

      position.value = p;

      let dcvX = interpolate(p.x, [0, size.value.width], [dutyCycleValueX.min, dutyCycleValueX.max]);
      let dcvY = interpolate(p.y, [size.value.height, 0], [dutyCycleValueY.min, dutyCycleValueY.max])

      dcvX += trim.x;
      dcvY += trim.y;

      dcvX = Math.max(Math.min(dcvX, dutyCycleValueX.max), dutyCycleValueX.min);
      dcvY = Math.max(Math.min(dcvY, dutyCycleValueY.max), dutyCycleValueY.min);

      if (onDeactivate) { runOnJS(onDeactivate)({ x: dcvX, y: dcvY }); }
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    top: position.value.y,
    left: position.value.x
  }));

  return (
    <Animated.View
      className="relative border border-white flex-1 overflow-hidden"
      style={{ aspectRatio: 1, width: "100%", maxHeight: "100%" }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        size.value = { width, height };

        // Default Position
        const value = { ...position.value };
        if (typeof defaultPosition?.x === "number") { value.x = interpolate(defaultPosition.x, [-100, 100], [0, width]); }
        if (typeof defaultPosition?.y === "number") { value.y = interpolate(-defaultPosition.y, [-100, 100], [0, height]); }
        position.value = value;
      }}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="w-[50] h-[50] rounded-full bg-white -translate-x-1/2 -translate-y-1/2"
          style={animatedStyle}
        />

        <View className="absolute top-1/2 w-full h-1 bg-white"></View>
        <View className="absolute left-1/2 w-1 h-full bg-white"></View>
      </GestureDetector>
    </Animated.View>
  );
}
