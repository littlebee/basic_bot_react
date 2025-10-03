import { useEffect, useRef } from "react";
import { WebRTCClient } from "../../utils/webrtcClient";

import st from "./WebRTCVideoClient.module.css";

export interface WebRTCVideoClientProps {
    /** Whether the WebRTC stream is currently active */
    isActive: boolean;
    /** Whether audio should be enabled (unmuted) */
    audioEnabled: boolean;
    /** Optional CSS class name to append to the component's outer containment element */
    className?: string;
}

/**
 * Displays WebRTC audio/video streams from a robot.
 *
 * This component establishes a WebRTC connection to stream real-time video
 * and audio from the robot. It automatically manages the connection lifecycle
 * based on the active state and provides audio muting control.
 */
export const WebRTCVideoClient: React.FC<WebRTCVideoClientProps> = ({
    isActive,
    audioEnabled,
    className,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const webrtcClient = useRef<WebRTCClient | null>(null);

    // Effect to manage connection based on active state
    useEffect(() => {
        if (!(videoRef.current && audioRef.current)) return;

        if (isActive) {
            webrtcClient.current = new WebRTCClient();
            webrtcClient.current.start(videoRef.current, audioRef.current);
        } else {
            webrtcClient.current?.stop();
            webrtcClient.current = null;
        }
    }, [isActive, videoRef, audioRef]);

    // Effect to manage audio muting
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = !audioEnabled;
            console.log("WebRTC: Audio", audioEnabled ? "enabled" : "muted");
        }
    }, [audioEnabled]);

    return (
        <div className={`${st.bbrWebRTCVideoClient} ${className || ""}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true} // Video audio is controlled by the separate audio element
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    backgroundColor: "#000",
                }}
            />
            <audio ref={audioRef} autoPlay muted={!audioEnabled} playsInline />
        </div>
    );
};
