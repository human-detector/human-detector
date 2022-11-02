import { BleManager, BleError, ScanOptions, Device, Characteristic, Subscription } from 'react-native-ble-plx';
import { BLEService, ConnectionStatus, WifiSecType } from '../src/ble/bleServices';
import { base64ToJson, jsonToBase64 } from '../src/ble/helpers';
import * as EyeSpyUUID from '../config/BLEConfig';

/**
 * Mocks NetInfo, needs to be top level otherwise mocking doesn't work
 */
jest.mock('@react-native-community/netinfo', () => ({
    fetch: async () => ({
        details: {
            ssid: 'SSID-A'
        }
    })
}));

describe(BLEService, () => {
    /**
     * Helper to create a characteristic from a value
     */
    const createCharacteristic = (value: any) => ({
            value
        } as unknown as jest.Mocked<Characteristic>);

    /**
     * Mocks for reading from BLE Device
     */
    const mockWifiTypeReturn = {
        Type: "KEY_PSK"
    };

    const mockSerialReturn = {
        Serial: "10000abcd",
        PubKey: "----START PUBLIC KEY-----\n1234567890abcdefg=\n-----END PUBLIC KEY\n"
    }

    const mockBleRead = jest.fn().mockImplementation(async (
        serviceUUID: string,
        charUUID: string
    ): Promise<Characteristic> => {
        
        if (serviceUUID !== EyeSpyUUID.BLE_SERVICE_UUID)
            throw new Error("Service does not exist");
        
        if (charUUID === EyeSpyUUID.SERIAL_UUID) {
            return createCharacteristic(jsonToBase64(mockSerialReturn));
        }

        if (charUUID === EyeSpyUUID.WIFI_CHECK_UUID) {
            return createCharacteristic(jsonToBase64(mockWifiTypeReturn));
        }

        throw new Error("Characteristic does not exist");
    });

    /**
     * Monitoring mocks
     */
    const mockBleMonitor = jest.fn().mockImplementation(async (
        serviceUUID: string,
        charUUID: string,
        callback: (error: BleError | null, char: Characteristic | null) => Promise<void>
    ) => {
        
        if (serviceUUID !== EyeSpyUUID.BLE_SERVICE_UUID || charUUID !== EyeSpyUUID.CONNECTION_UUID) {
            throw new Error("Service or Characteristic UUID do not exist");
        }

        callback(null, createCharacteristic(jsonToBase64({
            State: ConnectionStatus.CONNECTING,
            Reason: 0
        })));

        callback(null, createCharacteristic(jsonToBase64({
            State: ConnectionStatus.SUCCESS,
            Reason: 0
        })));

        return {
            remove: () => {}
        } as unknown as jest.Mocked<Subscription>;
    });

    /**
     * Mocks for scanning devices
     */
    const mockedDevice: jest.Mocked<Device> = {
        id: '12:34:56:78',
        connect: jest.fn().mockReturnThis(),
        isConnected: jest.fn().mockImplementation(async () => false),
        discoverAllServicesAndCharacteristics: jest.fn().mockReturnThis(),
        readCharacteristicForService: mockBleRead,
        writeCharacteristicWithResponseForService: jest.fn(),
        monitorCharacteristicForService: mockBleMonitor,
    } as unknown as jest.Mocked<Device>

    const mockStartDeviceScan = jest.fn().mockImplementation((
        UUIDs: string[] | null,
        options: ScanOptions | null, 
        callback: (error: BleError | null, device: Device | null) => void
    ) => {
        callback(null, mockedDevice);
    });

    const mockBleManager: jest.Mocked<BleManager> = {
        startDeviceScan: mockStartDeviceScan,
        stopDeviceScan: jest.fn(),
    } as unknown as jest.Mocked<BleManager>;

    const bleService = new BLEService(mockBleManager);

    it("Should scan for devices", () => {
        bleService.scanForDevices((devices) => {
            expect(devices).toContain(mockedDevice);
        });

        expect(bleService.getDevices()).toHaveLength(1);
        
        // Mostly testing that we are using the EyeSpy UUID
        expect(mockStartDeviceScan).toBeCalledWith(
            [EyeSpyUUID.BLE_SERVICE_UUID],
            null,
            expect.any(Function));
    });

    it("Should connect to the BLE device", async () => {
        await bleService.connectToDevice(mockedDevice);
        expect(mockedDevice.connect).toBeCalled();
        expect(mockedDevice.discoverAllServicesAndCharacteristics).toBeCalled();
        expect(bleService.getCurrentConnectedDevice()).toBe(mockedDevice);
    });

    it("Should get serial and public key from the Camera", async () => {
        await bleService.connectToDevice(mockedDevice);
        const serial = await bleService.getCameraSerialFromBLE()
        expect(serial).toStrictEqual(mockSerialReturn);
    });

    it("Should write wifi details to the Camera", async () => {
        await bleService.connectToDevice(mockedDevice);
        await bleService.writeCameraWifi(
            "Username-A",
            "Password-A",
            "UUID-A"
        );

        const writeJson = {
            SSID: "SSID-A",
            User: "Username-A",
            Pass: "Password-A",
            UUID: "UUID-A"
        }

        expect(mockedDevice.writeCharacteristicWithResponseForService).lastCalledWith(
            EyeSpyUUID.BLE_SERVICE_UUID,
            EyeSpyUUID.WIFI_UUID,
            expect.stringMatching(jsonToBase64(writeJson))
        );
    });

    it("Can check wifi type", async () => {
        const writeJson = {
            SSID: "SSID-A"
        };

        const wifiType = await bleService.checkWifiType();
        expect(wifiType).toEqual(WifiSecType.WPA2_PSK);

        expect(mockedDevice.writeCharacteristicWithResponseForService).lastCalledWith(
            EyeSpyUUID.BLE_SERVICE_UUID,
            EyeSpyUUID.WIFI_CHECK_UUID,
            expect.stringMatching(jsonToBase64(writeJson))
        );
    });

    it("Can monitor connection status", async () => {
        const callback = jest.fn();
        const sub = await bleService.checkCameraNotification(callback);
        expect(sub).toBeDefined();
        expect(callback).toBeCalledTimes(2);
    });

    it("Can convert base64 string to a JSON", () => {
        const base64Str = "eyJIZWxsbyI6IldvcmxkIn0=";
        const obj = {
            Hello: "World"
        };

        expect(base64ToJson(base64Str)).toStrictEqual(obj);
    });

    it("Can convert a JSON object to a base64 string", () => {
        const base64Str = "eyJHb29kQnllIjoiV29ybGQifQ==";
        const obj = {
            GoodBye: "World"
        };

        expect(jsonToBase64(obj)).toEqual(base64Str);
    });
});
