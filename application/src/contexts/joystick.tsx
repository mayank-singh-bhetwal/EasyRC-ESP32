import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { storage } from "../utils/storage";

const initial = {
  position: { lx: 0, ly: 0, rx: 0, ry: 0 },
  positionRange: {
    lx: { min: 0, max: 0 },
    ly: { min: 0, max: 0 },
    rx: { min: 0, max: 0 },
    ry: { min: 0, max: 0 }
  },
  trim: { lx: 0, ly: 0, rx: 0, ry: 0 }
};

export type KeyObject = typeof initial.position;
export type Key = keyof KeyObject;

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type JoystickContext = {
  position: React.RefObject<typeof initial.position>;

  positionRange: typeof initial.positionRange;
  setPositionRange: SetState<typeof initial.positionRange>;

  trim: typeof initial.trim;
  setTrim: SetState<typeof initial.trim>;

  save: () => void;
};

type StoredData = {
  positionRange: typeof initial.positionRange;
  trim: typeof initial.trim;
};

const JoystickContext = createContext<JoystickContext | null>(null);

export function JoystickProvider({ children }: { children: ReactNode; }) {
  const position = useRef(initial.position);

  const [positionRange, setPositionRange] = useState(initial.positionRange);
  const [trim, setTrim] = useState(initial.trim);

  function save() {
    storage.set("joystick-settings", JSON.stringify({ positionRange, trim }));
  }

  useEffect(() => {
    const data = storage.getString("joystick-settings");

    if (data === undefined) return;

    const pData = JSON.parse(data) as StoredData;
    setPositionRange(pData.positionRange);
    setTrim(pData.trim);
  }, []);

  return (
    <JoystickContext.Provider value={{
      position,
      positionRange, setPositionRange,
      trim, setTrim,
      save
    }}>
      {children}
    </JoystickContext.Provider>
  );
}

export function useJoystick() {
  const context = useContext(JoystickContext);
  if (context === null) { throw new Error("JoystickContext undefined!"); }
  return context;
}
