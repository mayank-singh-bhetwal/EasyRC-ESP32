import { useSerial } from "./contexts/serial";

import { SelectDevice } from "./select-device";
import { JoystickWrapper } from "./components/joystick-wrapper";

export function Home() {
  const serial = useSerial();
  
  if (!serial.port?.isConnected()) { return <SelectDevice />; }

  return <JoystickWrapper />;
}
