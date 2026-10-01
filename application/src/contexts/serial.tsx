import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { SerialTransport } from "react-native-serial-transport";

export type SerialDevice = {
  deviceId?: string;
  vendorId?: number;
  productId?: number;
  deviceName?: string;
};

type SerialContextType = {
  list: () => Promise<SerialDevice[]>;
  devices: SerialDevice[];
  connect: (deviceName?: string, baudRate?: number) => Promise<void>;
  disconnect: () => Promise<void>;
  port: SerialTransport | null;
  error: Error | null;
};

const SerialContext = createContext<SerialContextType | null>(null);

export function SerialProvider({ children }: { children: ReactNode; }) {
  const [devices, setDevices] = useState<SerialDevice[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const transportRef = useRef<SerialTransport | null>(null);

  if (!transportRef.current) {
    transportRef.current = new SerialTransport();
  }

  const port = transportRef.current;

  const list = useCallback(async () => {
    try {
      setError(null);
      const deviceList = await port.listDevices();
      const safeList = deviceList || [];
      setDevices(safeList);
      return safeList;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, [port]);

  const disconnect = useCallback(async () => {
    try {
      await port.disconnect();
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, [port]);

  const connect = useCallback(
    async (deviceName?: string, baudRate = 115200) => {
      setError(null);
      try {
        await port.connect(deviceName, baudRate);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      }
    },
    [port]
  );

  useEffect(() => {
    return () => { port.disconnect().catch(() => { }); };
  }, [port]);

  return (
    <SerialContext.Provider value={{ list, devices, connect, disconnect, port, error }}>
      {children}
    </SerialContext.Provider>
  );
}

export function useSerial() {
  const context = useContext(SerialContext);
  if (!context) { throw new Error("SerialProvider undefined!"); }
  return context;
}
