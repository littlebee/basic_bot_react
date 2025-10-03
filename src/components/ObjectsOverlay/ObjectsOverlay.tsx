import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";

import { IRecognizedObject } from "../../utils/hubState";
import { HubStateContext } from "../../context/HubStateProvider";

import st from "./ObjectsOverlay.module.css";

export interface ObjectsOverlayProps {
    /** Array of recognized objects to display with bounding boxes */
    recogObjects?: IRecognizedObject[];
}

/**
 * Draws bounding boxes with classification labels around recognized objects.
 *
 * This component overlays rectangular boxes on detected objects, displaying
 * their classification and confidence scores. Typically used on top of video
 * feeds to visualize computer vision detection results.
 *
 * Can be used with or without HubStateProvider:
 * - With props: Pass recogObjects directly
 * - With provider: Wrap in HubStateProvider and objects will be automatically populated from recognition state
 */
export function ObjectsOverlay({ recogObjects }: ObjectsOverlayProps) {
    // Try to get hub state from context (will be null if not in provider)
    const hubState = useContext(HubStateContext);

    // Use props if provided, otherwise fall back to context
    const objects = recogObjects ?? hubState?.recognition;

    if (!objects || objects.length < 1) {
        return null;
    }
    const elements = [];
    for (const obj of objects) {
        const [left, top, right, bottom] = obj.bounding_box;

        const style = {
            top,
            left,
            height: bottom - top,
            width: right - left,
        };
        // Use a uuid key here because we don't have a good way of uniquely identifying
        // these and having diff objects with the same key causes React to leave ghost
        // recog objects that wont go away until you turn off the overlay
        elements.push(
            <div className={st.objectSquare} style={style} key={uuidv4()}>
                <div className={st.objectClassification}>
                    {obj.classification}
                </div>
                <div className={st.objectConfidence}>
                    {obj.confidence.toFixed(3)}
                </div>
            </div>,
        );
    }
    return <div className={st.wrapper}>{elements}</div>;
}
