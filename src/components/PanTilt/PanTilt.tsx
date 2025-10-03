/*
A react component that allows the user to control the pan and tilt of the camera using
a two dimension click to move interface.  The user clicks on div and depending on where
they click the camera will pan and tilt to that position using the servos from central
hub key `servo_config` named "pan" and "tilt".
*/

import { useMemo, useCallback, useContext } from "react";

import { IServoConfig, IServo } from "../../utils/hubState";
import { sendHubStateUpdate } from "../../utils/hubMessages";
import { mapPanTiltToXYSquare, mapXYToPanTilt } from "../../utils/angleUtils";
import { isTouchEvent } from "../../utils/uiUtils";
import { HubStateContext } from "../../context/HubStateProvider";
import st from "./PanTilt.module.css";

const TOUCH_GRID_SIZE = 200;
const ANGLE_INDICATOR_RADUIS = 10;
const ACTUAL_INDICATOR_RADUIS = 8;

export interface PanTiltProps {
    /** Servo configuration defining pan and tilt servo parameters */
    servoConfig?: IServoConfig;
    /** Target servo angles (pan/tilt) to move to */
    servoAngles?: Record<string, number>;
    /** Actual current servo angles (pan/tilt) */
    servoActualAngles?: Record<string, number>;
    /** Optional CSS class name to append to the component's outer containment element */
    className?: string;
}

/**
 * A touchscreen joystick for controlling pan and tilt servos.
 *
 * This component provides an interactive 2D control interface for adjusting
 * camera pan and tilt servos. Users can click or touch anywhere on the control
 * grid to set target angles. Visual indicators show both target and actual
 * servo positions. Requires servo configuration with servos named "pan" and "tilt".
 *
 * Can be used with or without HubStateProvider:
 * - With props: Pass servoConfig, servoAngles, and servoActualAngles directly
 * - With provider: Wrap in HubStateProvider and props will be automatically populated
 */
export function PanTilt({
    servoConfig,
    servoAngles,
    servoActualAngles,
    className,
}: PanTiltProps) {
    // Try to get hub state from context (will be null if not in provider)
    const hubState = useContext(HubStateContext);

    // Use props if provided, otherwise fall back to context
    const config = servoConfig ?? hubState?.servo_config;
    const angles = servoAngles ?? hubState?.servo_angles;
    const actualAngles = servoActualAngles ?? hubState?.servo_actual_angles;

    const [panServo, tiltServo]: [IServo | null, IServo | null] =
        useMemo(() => {
            let pan = null;
            let tilt = null;
            if (config) {
                for (const servo of config.servos) {
                    if (servo.name === "pan") {
                        pan = servo;
                    } else if (servo.name === "tilt") {
                        tilt = servo;
                    }
                }
            }
            return [pan, tilt];
        }, [config]);

    const [angleX, angleY]: [number, number] = useMemo(() => {
        if (!panServo || !tiltServo || !angles) {
            return [0, 0];
        }
        return mapPanTiltToXYSquare(
            angles["pan"],
            panServo,
            angles["tilt"],
            tiltServo,
            TOUCH_GRID_SIZE,
            ANGLE_INDICATOR_RADUIS,
        );
    }, [angles, panServo, tiltServo]);

    const [angleActualX, angleActualY]: [number, number] = useMemo(() => {
        if (!panServo || !tiltServo || !actualAngles) {
            return [0, 0];
        }
        return mapPanTiltToXYSquare(
            actualAngles["pan"],
            panServo,
            actualAngles["tilt"],
            tiltServo,
            TOUCH_GRID_SIZE,
            ACTUAL_INDICATOR_RADUIS,
        );
    }, [actualAngles, panServo, tiltServo]);

    const handleTouch = useCallback(
        (
            event:
                | React.MouseEvent<HTMLDivElement>
                | React.TouchEvent<HTMLDivElement>,
        ) => {
            if (!panServo || !tiltServo) {
                return;
            }
            const isTouch = isTouchEvent(event);
            const clientX = isTouch ? event.touches[0].clientX : event.clientX;
            const clientY = isTouch ? event.touches[0].clientY : event.clientY;

            const rect = event.currentTarget.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const [panAngle, tiltAngle] = mapXYToPanTilt(
                x,
                y,
                panServo,
                tiltServo,
                TOUCH_GRID_SIZE,
            );
            console.log({ x, y, panAngle, tiltAngle });
            sendHubStateUpdate({
                servo_angles: { pan: panAngle, tilt: tiltAngle },
            });
        },
        [panServo, tiltServo],
    );

    if (!config) {
        return null;
    }
    if (!panServo || !tiltServo) {
        console.error(
            "Servo named 'pan' or 'tilt' not found in servo config",
            config,
        );
        return null;
    }

    return (
        <div
            className={`${st.bbrPanTilt} ${className || ""}`}
            data-testid="pan-tilt"
        >
            <h4>Pan ({actualAngles?.["pan"].toFixed(1)})</h4>
            <div className={st.servoRange}>
                <div>{panServo.max_angle}&deg;</div>
                <div className={st.spacer} />
                <div>{panServo.min_angle}&deg;</div>
            </div>
            <div className={st.innerContainer}>
                <div className={st.tiltLabelsContainer}>
                    <h4>Tilt ({angleActualY.toFixed(1)})</h4>
                    <div className={st.servoRange}>
                        <div>{tiltServo.max_angle}&deg;</div>
                        <div className={st.spacer} />
                        <div>{tiltServo.min_angle}&deg;</div>
                    </div>
                </div>
                <div
                    className={st.touchGrid}
                    onClick={handleTouch}
                    onTouchEnd={handleTouch}
                >
                    <div
                        className={st.angleXY}
                        style={{ top: `${angleY}px`, left: `${angleX}px` }}
                    />
                    <div
                        className={st.angleActualXY}
                        style={{
                            top: `${angleActualY}px`,
                            left: `${angleActualX}px`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
