/**
 * WebRTC Client for Video/Audio Streaming
 *
 * This module provides a WebRTC client for establishing real-time audio and
 * video connections with a robot's streaming server.
 *
 * @module webrtcClient
 */

import { videoHost } from "./hubState";

/**
 * WebRTC client for receiving video and audio streams from the robot.
 *
 * Manages the WebRTC peer connection, handles SDP offer/answer negotiation,
 * and connects incoming media tracks to HTML video and audio elements.
 *
 * @example
 * ```typescript
 * const client = new WebRTCClient();
 * const videoEl = document.querySelector('video');
 * const audioEl = document.querySelector('audio');
 * client.start(videoEl, audioEl);
 *
 * // Later, to stop streaming:
 * client.stop();
 * ```
 */
export class WebRTCClient {
    private pc: RTCPeerConnection | null = null;
    private webrtcServerUrl = `http://${videoHost}/offer`;

    /**
     * Negotiates the WebRTC connection with the server.
     *
     * Performs SDP offer/answer exchange, waits for ICE gathering to complete,
     * sends the offer to the server, and processes the server's answer.
     *
     * @private
     * @returns Promise that resolves when negotiation completes
     */
    private negotiate() {
        if (!this.pc) return Promise.reject("PeerConnection not initialized");

        this.pc.addTransceiver("video", { direction: "recvonly" });
        this.pc.addTransceiver("audio", { direction: "recvonly" });
        return this.pc
            .createOffer()
            .then((offer) => {
                return this.pc && this.pc.setLocalDescription(offer);
            })
            .then(() => {
                // wait for ICE gathering to complete
                return new Promise((resolve) => {
                    if (this.pc && this.pc.iceGatheringState === "complete") {
                        resolve(void 0);
                    } else {
                        if (!this.pc) return;
                        const checkState = () => {
                            if (!this.pc) return;
                            if (this.pc.iceGatheringState === "complete") {
                                this.pc.removeEventListener(
                                    "icegatheringstatechange",
                                    checkState
                                );
                                resolve(void 0);
                            }
                        };
                        this.pc.addEventListener(
                            "icegatheringstatechange",
                            checkState
                        );
                    }
                });
            })
            .then(() => {
                if (!this.pc) return;
                const offer = this.pc.localDescription;
                if (!offer) {
                    console.error(
                        "webrtcClient: No local description available"
                    );
                    return;
                }
                return fetch(this.webrtcServerUrl, {
                    body: JSON.stringify({
                        sdp: offer.sdp,
                        type: offer.type,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                });
            })
            .then((response) => {
                if (!response || !response.ok) {
                    throw new Error(
                        `webrtcClient: Failed to get answer from server: ${
                            response ? response.statusText : "No response"
                        }`
                    );
                }
                return response && response.json();
            })
            .then((answer) => {
                if (!this.pc) {
                    console.error(
                        "webrtcClient: Got offer answer but PeerConnection not initialized"
                    );
                    return;
                }
                return this.pc.setRemoteDescription(answer);
            })
            .catch((e) => {
                alert(e);
            });
    }

    /**
     * Starts the WebRTC connection and begins receiving media streams.
     *
     * Creates a new RTCPeerConnection, sets up track event listeners to
     * connect incoming video and audio streams to the provided HTML elements,
     * and initiates the SDP negotiation process.
     *
     * @param videoElement - HTML video element to receive video stream
     * @param audioElement - HTML audio element to receive audio stream
     *
     * @example
     * ```typescript
     * const client = new WebRTCClient();
     * const video = document.getElementById('robot-video') as HTMLVideoElement;
     * const audio = document.getElementById('robot-audio') as HTMLAudioElement;
     * client.start(video, audio);
     * ```
     */
    start(videoElement: HTMLVideoElement, audioElement: HTMLAudioElement) {
        this.pc = new RTCPeerConnection();

        // connect audio / video
        this.pc.addEventListener("track", (evt) => {
            if (evt.track.kind == "video") {
                videoElement.srcObject = evt.streams[0];
            } else if (evt.track.kind == "audio") {
                audioElement.srcObject = evt.streams[0];
            }
        });

        this.negotiate();
    }

    /**
     * Stops the WebRTC connection and closes the peer connection.
     *
     * Closes the RTCPeerConnection and releases associated resources.
     * Safe to call multiple times - subsequent calls are no-ops.
     *
     * @example
     * ```typescript
     * client.stop();
     * ```
     */
    stop() {
        if (!this.pc) {
            console.debug("webrtcClient#stop(): PeerConnection already closed");
            return;
        }
        this.pc.close();
        this.pc = null;
    }
}
