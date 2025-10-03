import { useState } from "react";

import { videoHost } from "../../utils/hubState";

import st from "./VideoFeed.module.css";

export interface VideoFeedProps {
    /** Whether the video feed is currently active and should be displayed */
    isActive: boolean;
    /** Optional CSS class name to append to the component's outer containment element */
    className?: string;
}

/**
 * Displays an MJPEG video stream from a robot vision service.
 *
 * This component renders a Motion JPEG video feed from the robot's camera.
 * When inactive, it displays a "please stand by" placeholder image to prevent
 * unnecessary network traffic. Handles loading states and connection errors.
 */
export const VideoFeed: React.FC<VideoFeedProps> = ({
    isActive,
    className,
}) => {
    const [rand] = useState<number>(0);
    const [errorMsg, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // TODO : this is a hack to force the video feed to reload every 30 seconds, but
    //   is it necessary?  I forget what problem this was solving - maybe caching
    //   issue?  If so, we should fix the caching issue instead of doing this.
    // useEffect(() => {
    //     setInterval(() => {
    //         setRand(Math.random());
    //     }, 30000);
    // }, []);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(true);
        console.error("got error from image load", e);
        setErrorMessage(`Unable to get video feed from ${videoHost}`);
    };

    const handleLoad = () => {
        console.log("video feed loaded");
        setErrorMessage(null);
        setIsLoading(false);
    };

    const feedUrl = `http://${videoHost}/video_feed?rand=${rand}`;
    let imgStyle = {};
    let src = feedUrl;
    let alt = "video feed";
    if (!isActive) {
        imgStyle = { display: "none" };
    }
    // IMPORTANT: must change the src if changing active state,
    // because the browser will continue to stream the MJPEG if not.
    // Note the removing the img from the DOM also does NOT stop the stream.
    if (isLoading || errorMsg || !isActive) {
        src = "/please-stand-by.png";
        alt = "please stand by";
    }
    // note must always render the img or it endlessly triggers onLoad

    return (
        <div className={`${st.bbrVideoFeed} ${className || ""}`}>
            <img
                style={imgStyle}
                alt={alt}
                src={src}
                onError={handleError}
                onLoad={handleLoad}
            />
        </div>
    );
};
