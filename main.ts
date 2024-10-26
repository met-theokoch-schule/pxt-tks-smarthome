smarthome.onTouchSensorTouched(TouchSensor.S0, function () {
    basic.showLeds(`
        # . . . #
        . . . . .
        . . . . .
        . . . . .
        # . . . #
        `)
})
input.onPinTouchEvent(TouchPin.P1, input.buttonEventDown(), function () {
    basic.showLeds(`
        . . . . .
        . . . . .
        # # # . .
        . . . . .
        . . . . .
        `)
})
input.onSound(DetectedSound.Loud, function () {
    basic.showLeds(`
        . . . . #
        . . . . .
        . . # . .
        . . . . .
        # . . . .
        `)
})
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    basic.showIcon(IconNames.No)
})
smarthome.onPresenceDetected(function () {
    basic.showIcon(IconNames.Butterfly)
    music.playTone(262, music.beat(BeatFraction.Whole))
})
const enum TouchSensor {
    S0 = 0b000000000001,
    S1 = 0b000000000010,
    S2 = 0b000000000100,
    S3 = 0b000000001000,
    S4 = 0b000000010000,
    S5 = 0b000000100000,
    S6 = 0b000001000000,
    S7 = 0b000010000000,
    S8 = 0b000100000000,
    S9 = 0b001000000000,
    // T10 = 0b010000000000, //not used
    // T11 = 0b100000000000. //not used
}
namespace smarthome {

    /**
     * Code für NeoPixel LED's (Lampen)
     * based on https://github.com/MKleinSB/pxt-callicolor/blob/master/callicolor.ts
     * by Michael Klein which took parts from
     * https://github.com/BrightWearables/pxt-microbit-brightboard
     */

    let Lampen = neopixel.create(DigitalPin.C8, 11, NeoPixelMode.RGB)

    const enum cbrightness {
        //% block="100"
        hp1 = 1,
        //% block="80"
        hp2 = 2,
        //% block="60"
        hp6 = 6,
        //% block="40"
        hp25 = 25,
        //% block="20"
        hp85 = 85
    }

    let ccolors = [0xff0000, 0xFF7F00, 0xFFFE00, 0x7FFF00, 0x00FF00, 0x00FF7F,
        0x00FFFE, 0x0040FF, 0x0000FF, 0x6000FF, 0xFE00FF, 0xFF0040]

    //% block="Set wall light to $color1 $color2 $color3 $color4 $color5 $color6 $color7 $color8"
    //% block.loc.de="Setze Wandlampe auf $color1 $color2 $color3 $color4 $color5 $color6 $color7 $color8"       
    //% color1.shadow="LampenColorNumberPicker"  color1.defl=0xff0000
    //% color2.shadow="LampenColorNumberPicker"  color2.defl=0xFF7F00
    //% color3.shadow="LampenColorNumberPicker"  color3.defl=0xFFFE00
    //% color4.shadow="LampenColorNumberPicker"  color4.defl=0x7FFF00
    //% color5.shadow="LampenColorNumberPicker"  color5.defl=0x00FF00
    //% color6.shadow="LampenColorNumberPicker"  color6.defl=0x00FF7F
    //% color7.shadow="LampenColorNumberPicker"  color7.defl=0x00FFFE
    //% color8.shadow="LampenColorNumberPicker"  color8.defl=0x0040FF
    //% inlineInputMode=inline
    export function ShowColorPixel(color1: number, color2: number, color3: number, color4: number, color5: number, color6: number, color7: number, color8: number) {
        Lampen.setPixelColor(3, color1)
        Lampen.setPixelColor(4, color2)
        Lampen.setPixelColor(5, color3)
        Lampen.setPixelColor(6, color4)
        Lampen.setPixelColor(7, color5)
        Lampen.setPixelColor(8, color6)
        Lampen.setPixelColor(9, color7)
        Lampen.setPixelColor(10, color8)
        Lampen.show()
    }

    /**
    * Custom color picker
    */
    //% blockId=LampenColorNumberPicker block="%value"
    //% blockHidden=true
    //% shim=TD_ID
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% weight=150
    //% value.fieldOptions.colours='["#ffffff","#ff0000","#ffaa00","#ffdc00","#ffff00","#eaff00","#8eff00","#4df243","#42b87f","#00ffdc","#00dcff","#00a3ff","#0087ff","#acb3f3","#e0acfe","#a300ff","#ea00ff","#ff00e3","#fdd3f8","#f1d07e","#a8b5f5","#C3C6D8", "#f3f2da","#727474", "#000000"]'
    //% value.fieldOptions.columns=5 value.fieldOptions.className='rgbColorPicker'  
    export function CalliColorNumberPicker(value: number) {
        return value;
    }

    /**
     * Code für die Touch Schalter
     * based on https://github.com/mkleinsb/pxt-mpr121 by Michael Klein
     * mpr 121 touch blocks based on touch.ts 0.17.5
     * Auf Basis von https://github.com/1010Technologies/pxt-makerbit
     * Copyright (c) 2018 Roger Wagner, Philipp Henkel & Michael Klein
     * MIT License
     */

    const MPR121_ADDRESS = 0x5A
    const TOUCH_STATUS_PAUSE_BETWEEN_READ = 50

    interface TouchController {
        lastTouchStatus: number
        lastEventValue: number
    }

    let touchController: TouchController

    const MPR121_TOUCH_SENSOR_TOUCHED_ID = 2148
    const MPR121_TOUCH_SENSOR_RELEASED_ID = 2149
    

    /**
     * Initialize the touch controller.
     */

    //% blockId="mpr121_touch_init" block="initialisiere touch-Sensor"
    //% weight=70
    function initTouchController(): void {

        if (!!touchController) {
            return
        }

        touchController = {
            lastTouchStatus: 0,
            lastEventValue: 0,
        }

        const addr = MPR121_ADDRESS
        mpr121.reset(addr)

        // Stop capture
        mpr121.stop(addr)

        // Input filter for rising state
        mpr121.configure(addr, mpr121.Config.MHDR, 0x01)
        mpr121.configure(addr, mpr121.Config.NHDR, 0x01)
        mpr121.configure(addr, mpr121.Config.NCLR, 0x10)
        mpr121.configure(addr, mpr121.Config.FDLR, 0x20)

        // Input filter for falling state
        mpr121.configure(addr, mpr121.Config.MHDF, 0x01)
        mpr121.configure(addr, mpr121.Config.NHDF, 0x01)
        mpr121.configure(addr, mpr121.Config.NCLF, 0x10)
        mpr121.configure(addr, mpr121.Config.FDLF, 0x20)

        // Input filter for touched state
        mpr121.configure(addr, mpr121.Config.NHDT, 0x01)
        mpr121.configure(addr, mpr121.Config.NCLT, 0x10)
        mpr121.configure(addr, mpr121.Config.FDLT, 0xFF)

        // Unused proximity sensor filter
        mpr121.configure(addr, mpr121.Config.MHDPROXR, 0x0F)
        mpr121.configure(addr, mpr121.Config.NHDPROXR, 0x0F)
        mpr121.configure(addr, mpr121.Config.NCLPROXR, 0x00)
        mpr121.configure(addr, mpr121.Config.FDLPROXR, 0x00)
        mpr121.configure(addr, mpr121.Config.MHDPROXF, 0x01)
        mpr121.configure(addr, mpr121.Config.NHDPROXF, 0x01)
        mpr121.configure(addr, mpr121.Config.NCLPROXF, 0xFF)
        mpr121.configure(addr, mpr121.Config.FDLPROXF, 0xFF)
        mpr121.configure(addr, mpr121.Config.NHDPROXT, 0x00)
        mpr121.configure(addr, mpr121.Config.NCLPROXT, 0x00)
        mpr121.configure(addr, mpr121.Config.FDLPROXT, 0x00)

        // Debounce configuration (used primarily for interrupts)
        mpr121.configure(addr, mpr121.Config.DTR, 0x11)

        // Electrode clock frequency etc
        mpr121.configure(addr, mpr121.Config.AFE1, 0xFF)
        mpr121.configure(addr, mpr121.Config.AFE2, 0x30)

        // Enable autoconfiguration / calibration
        mpr121.configure(addr, mpr121.Config.AUTO_CONFIG_0, 0x00)
        mpr121.configure(addr, mpr121.Config.AUTO_CONFIG_1, 0x00)

        // Tuning parameters for the autocalibration algorithm
        mpr121.configure(addr, mpr121.Config.AUTO_CONFIG_USL, 0x00)
        mpr121.configure(addr, mpr121.Config.AUTO_CONFIG_LSL, 0x00)
        mpr121.configure(addr, mpr121.Config.AUTO_CONFIG_TL, 0x00)

        // Default sensitivity thresholds
        mpr121.configureThresholds(addr, 60, 20)

        // Restart capture
        mpr121.start(
            addr,
            mpr121.CalibrationLock.BaselineTrackingAndInitialize,
            mpr121.Proximity.DISABLED,
            mpr121.Touch.ELE_0_TO_11
        )
        control.inBackground(detectAndNotifyTouchEvents)
    }

    function detectAndNotifyTouchEvents() {
        let previousTouchStatus = 0
        
        while (true) {
            const touchStatus = mpr121.readTouchStatus(MPR121_ADDRESS)
            touchController.lastTouchStatus = touchStatus

            for (let touchSensorBit = 1; touchSensorBit <= 2048; touchSensorBit <<= 1) {

                // Raise event when touch starts
                if ((touchSensorBit & touchStatus) !== 0) {
                    if (!((touchSensorBit & previousTouchStatus) !== 0)) {
                        control.raiseEvent(MPR121_TOUCH_SENSOR_TOUCHED_ID, touchSensorBit)
                        touchController.lastEventValue = touchSensorBit
                    }
                }

                // Raise event when touch ends
                if ((touchSensorBit & touchStatus) === 0) {
                    if (!((touchSensorBit & previousTouchStatus) === 0)) {
                        control.raiseEvent(MPR121_TOUCH_SENSOR_RELEASED_ID, touchSensorBit)
                        touchController.lastEventValue = touchSensorBit
                    }
                }
            }

            previousTouchStatus = touchStatus

            basic.pause(TOUCH_STATUS_PAUSE_BETWEEN_READ)
        }
    }

    /**
     * Mache etwas, wenn ein spezieller Sensor berührt wird.
     * Dieses Touch-Ereignis wird direkt zu Beginn der Berührung ausgeführt.
     * @param sensor der Touchsensor der überwacht werden soll, z.B.: TouchSensor.T0
     * @param handler body code der bei der Berührung des Sensors ausgeführt werden soll
    */

    //% blockId=mpr121_touch_on_touch_sensor_down
    //% block="wenn Schalter | %sensor | gedrückt"
    //% sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=3
    //% sensor.fieldOptions.tooltips="false"
    //% weight=65
    export function onTouchSensorTouched(sensor: TouchSensor, handler: () => void) {
        initTouchController()
        control.onEvent(MPR121_TOUCH_SENSOR_TOUCHED_ID, sensor, () => {
            setupContextAndNotify(handler)
        })
    }
 
    function setupContextAndNotify(handler: () => void) {
        touchController.lastEventValue = control.eventValue()
        handler()
    }

    // Communication module for MPR121 capacitive touch sensor controller
    // https://www.sparkfun.com/datasheets/Components/MPR121.pdf
    export namespace mpr121 {

        export enum CalibrationLock {
            BaselineTrackingOn = 0b00,
            BaselineTrackingOff = 0b01,
            BaselineTrackingAndInitializeFirst5MSB = 0b10,
            BaselineTrackingAndInitialize = 0b11
        }

        export enum Proximity {
            DISABLED = 0b00,
            ELE0_TO_1 = 0b01,
            ELE_0_TO_3 = 0b10,
            ELE_0_TO_11 = 0b11
        }

        export enum Touch {
            DISABLED = 0b0000,
            ELE_0 = 0b0001,
            ELE_0_TO_1 = 0b0010,
            ELE_0_TO_2 = 0b0011,
            ELE_0_TO_3 = 0b0100,
            ELE_0_TO_4 = 0b0101,
            ELE_0_TO_5 = 0b0110,
            ELE_0_TO_6 = 0b0111,
            ELE_0_TO_7 = 0b1000,
            ELE_0_TO_8 = 0b1001,
            ELE_0_TO_9 = 0b1010,
            ELE_0_TO_10 = 0b1011,
            ELE_0_TO_11 = 0b1100
        }

        export enum Config {
            MHDR = 0x2B,
            NHDR = 0x2C,
            NCLR = 0x2D,
            FDLR = 0x2E,
            MHDF = 0x2F,
            NHDF = 0x30,
            NCLF = 0x31,
            FDLF = 0x32,
            NHDT = 0x33,
            NCLT = 0x34,
            FDLT = 0x35,
            MHDPROXR = 0x36,
            NHDPROXR = 0x37,
            NCLPROXR = 0x38,
            FDLPROXR = 0x39,
            MHDPROXF = 0x3A,
            NHDPROXF = 0x3B,
            NCLPROXF = 0x3C,
            FDLPROXF = 0x3D,
            NHDPROXT = 0x3E,
            NCLPROXT = 0x3F,
            FDLPROXT = 0x40,
            E0TTH = 0x41,
            E0RTH = 0x42,
            E1TTH = 0x43,
            E1RTH = 0x44,
            E2TTH = 0x45,
            E2RTH = 0x46,
            E3TTH = 0x47,
            E3RTH = 0x48,
            E4TTH = 0x49,
            E4RTH = 0x4A,
            E5TTH = 0x4B,
            E5RTH = 0x4C,
            E6TTH = 0x4D,
            E6RTH = 0x4E,
            E7TTH = 0x4F,
            E7RTH = 0x50,
            E8TTH = 0x51,
            E8RTH = 0x52,
            E9TTH = 0x53,
            E9RTH = 0x54,
            E10TTH = 0x55,
            E10RTH = 0x56,
            E11TTH = 0x57,
            E11RTH = 0x58,
            E12TTH = 0x59,
            E12RTH = 0x5A,
            DTR = 0x5B,
            AFE1 = 0x5C,
            AFE2 = 0x5D,
            ECR = 0x5E,
            CDC0 = 0x5F,
            CDC1 = 0x60,
            CDC2 = 0x62,
            CDC4 = 0x63,
            CDC5 = 0x64,
            CDC6 = 0x65,
            CDC7 = 0x66,
            CDC8 = 0x67,
            CDC9 = 0x68,
            CDC10 = 0x69,
            CDC11 = 0x6A,
            CDC12 = 0x6B,
            CDT_0_1 = 0x6C,
            CDT_2_3 = 0x6D,
            CDT_4_5 = 0x6E,
            CDT_6_7 = 0x6F,
            CDT_8_9 = 0x70,
            CDT_10_11 = 0x71,
            CDT_12 = 0x72,
            GPIO_CTL0 = 0x73,
            GPIO_CTL1 = 0x74,
            GPIO_DIR = 0x76,
            GPIO_EN = 0x77,
            GPIO_SET = 0x78,
            GPIO_CLR = 0x79,
            GPIO_TOG = 0x7A,
            AUTO_CONFIG_0 = 0x7B,
            AUTO_CONFIG_1 = 0x7C,
            AUTO_CONFIG_USL = 0x7D,
            AUTO_CONFIG_LSL = 0x7E,
            AUTO_CONFIG_TL = 0x7F
        }

        let commandDataBuffer: Buffer
        let commandBuffer: Buffer

        function writeCommandData(address: number, command: number, data: number): void {
            if (!commandDataBuffer) {
                commandDataBuffer = pins.createBuffer(pins.sizeOf(NumberFormat.UInt16BE))
            }
            commandDataBuffer.setNumber(NumberFormat.UInt16BE, 0, (command << 8) | data)
            pins.i2cWriteBuffer(address, commandDataBuffer)
        }

        function writeCommand(address: number, command: number): void {
            if (!commandBuffer) {
                commandBuffer = pins.createBuffer(pins.sizeOf(NumberFormat.UInt8BE))
            }
            commandBuffer.setNumber(NumberFormat.UInt8BE, 0, command)
            pins.i2cWriteBuffer(address, commandBuffer)
        }

        export function configure(address: number, register: Config, value: number): void {
            writeCommandData(address, register, value)
        }

        export function configureThresholds(address: number, touch: number, release: number): void {
            for (let i = 0; i < 12; i++) {
                configure(address, Config.E0TTH + i * 2, touch)
                configure(address, Config.E0RTH + i * 2, release)
            }
        }

        export function reset(address: number): void {
            writeCommandData(address, 0x80, 0x63)
            basic.pause(30)
        }

        export function stop(address: number): void {
            writeCommandData(address, Config.ECR, 0x0)
        }

        export function start(address: number, cl: CalibrationLock, eleprox: Proximity, ele: Touch): void {
            writeCommandData(address, Config.ECR, (cl << 6) | (eleprox << 4) | ele)
        }

        export function readTouchStatus(address: number): number {
            writeCommand(address, 0x0)
            return pins.i2cReadNumber(address, NumberFormat.UInt16LE)
        }
    }

    /**
     * Code for the presence controller.
     * by Moritz Metelmann
     */

    interface PresenceDetector {
        lastPresenceDetection: boolean
    }

    let presenceDetector: PresenceDetector
    const PRESENCE_DETECTED_ID = 2147

    /**
     * Initialize the presence controller.
     */

    //% blockId="presence_init" block="initialisiere Präsenz-Sensor"
    //% weight=70
    function initPresenceDetector(): void {

        if (!!presenceDetector) {
            return
        }

        presenceDetector = {
            lastPresenceDetection: false
        }

        control.inBackground(detectAndNotifyPresenceDetector)
    }

    function detectAndNotifyPresenceDetector() {
        let previousPresenceStatus = false;

        while (true) {
            if (previousPresenceStatus == false && pins.digitalReadPin(DigitalPin.C9) == 0) {
                control.raiseEvent(PRESENCE_DETECTED_ID, 0);
                previousPresenceStatus = true;
            }
            if (previousPresenceStatus == true && pins.digitalReadPin(DigitalPin.C9) == 1) {
                previousPresenceStatus = false;
            }

            basic.pause(TOUCH_STATUS_PAUSE_BETWEEN_READ)
        }


    }

    //% blockId=smarthome_presence_detected
    //% block="wenn Präsenz gemeldet"
    //% weight=65
    export function onPresenceDetected(handler: () => void) {
        initPresenceDetector();
        control.onEvent(PRESENCE_DETECTED_ID, EventBusValue.MICROBIT_EVT_ANY, () => {
            handler();
        })
    }
}
basic.showLeds(`
    . . . . .
    . . . . .
    . . # . .
    . . . . .
    . . . . .
    `)
basic.forever(function () {
	
})
