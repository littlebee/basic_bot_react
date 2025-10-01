/**
 * Angle Calculation Utilities
 *
 * This module provides utility functions for angle calculations and coordinate
 * transformations, particularly for pan/tilt servo control interfaces.
 *
 * @module angleUtils
 */

import { IServo } from "./hubState";

const ANGLE_CLOSE_ENOUGH: number = 0.5;

/**
 * Determines if two arrays of angles are approximately equal.
 *
 * Compares corresponding angles in two arrays and returns true if all
 * differences are within 0.5 degrees.
 *
 * @param anglesA - First array of angles in degrees
 * @param anglesB - Second array of angles in degrees
 * @returns True if all angles are within tolerance
 */
export function anglesCloseEnough(
    anglesA: number[],
    anglesB: number[]
): boolean {
    for (let i = 0; i < anglesA.length; i++) {
        if (Math.abs(anglesA[i] - anglesB[i]) > ANGLE_CLOSE_ENOUGH) {
            return false;
        }
    }
    return true;
}

/**
 * Calculates the angle in degrees from point A to point B in 2D space.
 *
 * Uses atan2 to compute the angle from the first point to the second point.
 * The angle is measured counter-clockwise from the positive X axis.
 *
 * @param x1 - X coordinate of point A
 * @param y1 - Y coordinate of point A
 * @param x2 - X coordinate of point B
 * @param y2 - Y coordinate of point B
 * @returns Angle in degrees from point A to point B
 */
export function findAngle(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number {
    const angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 360) / Math.PI;
    console.log({ x1, y1, x2, y2, angleDeg });
    return angleDeg;
}

/**
 * Converts pan/tilt servo angles to XY coordinates in a square control grid.
 *
 * Maps servo angles to pixel coordinates for displaying position indicators
 * in a pan/tilt control interface. Accounts for servo range constraints and
 * indicator size.
 *
 * @param panAngle - Current pan angle in degrees
 * @param panServo - Pan servo configuration
 * @param tiltAngle - Current tilt angle in degrees
 * @param tiltServo - Tilt servo configuration
 * @param containerSize - Size of the square container in pixels
 * @param indicatorRadius - Radius of the position indicator in pixels
 * @returns Tuple of [x, y] coordinates in pixels
 */
export function mapPanTiltToXYSquare(
    panAngle: number,
    panServo: IServo,
    tiltAngle: number,
    tiltServo: IServo,
    containerSize: number,
    indicatorRadius: number
): [number, number] {
    const xf =
        panAngle - panServo.min_angle / panServo.max_angle - panServo.min_angle;
    const x =
        containerSize -
        (xf * containerSize) / (panServo.max_angle - panServo.min_angle);

    const yf =
        tiltAngle -
        tiltServo.min_angle / tiltServo.max_angle -
        tiltServo.min_angle;
    const y =
        (yf * containerSize) / (tiltServo.max_angle - tiltServo.min_angle);

    return [x - indicatorRadius, y - indicatorRadius];
}

/**
 * Converts XY coordinates in a square control grid to pan/tilt servo angles.
 *
 * Maps click/touch coordinates from a pan/tilt control interface to the
 * corresponding servo angles. Inverse operation of mapPanTiltToXYSquare.
 *
 * @param x - X coordinate in pixels
 * @param y - Y coordinate in pixels
 * @param panServo - Pan servo configuration
 * @param tiltServo - Tilt servo configuration
 * @param containerSize - Size of the square container in pixels
 * @returns Tuple of [panAngle, tiltAngle] in degrees
 *
 * @example
 * ```typescript
 * const [panAngle, tiltAngle] = mapXYToPanTilt(
 *   100, 50,
 *   panServo, tiltServo,
 *   200
 * );
 * sendHubStateUpdate({ servo_angles: { pan: panAngle, tilt: tiltAngle } });
 * ```
 */
export function mapXYToPanTilt(
    x: number,
    y: number,
    panServo: IServo,
    tiltServo: IServo,
    containerSize: number
): [number, number] {
    const panAngle =
        panServo.max_angle -
        (x * (panServo.max_angle - panServo.min_angle)) / containerSize;
    const tiltAngle =
        (y * (tiltServo.max_angle - tiltServo.min_angle)) / containerSize +
        tiltServo.min_angle;

    return [panAngle, tiltAngle];
}
