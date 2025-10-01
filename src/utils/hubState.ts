/**
 * Hub State Management
 *
 * This module provides WebSocket-based communication with the basic_bot central hub.
 * It manages connection state, handles message passing, and maintains synchronized
 * state between the web application and the robot's central hub.
 *
 * @module hubState
 */

const urlParams = new URLSearchParams(window.location.search);
const debugThings = urlParams.get("debug")?.split(",") || [];

/** Enable debug logging for hub messages (set via ?debug=messages query param) */
export const logMessages = debugThings.indexOf("messages") >= 0;

/** Hub hostname (from ?hubHost query param or current hostname) */
export const hubHost = urlParams.get("hubHost") || window.location.hostname;

/** Video feed hostname with default port */
export const videoHost = hubHost + ":5801";

// How often to check if hub is really still alive
const HUB_PING_INTERVAL = 1000;
// with us pinging every 1000ms, there should
// never be a lapse of more than 1500 between
// messages from hub.  Otherwise, we show "offline"
const MIN_HUB_UPDATE_INTERVAL = 1500;

/** Default port for the basic_bot central hub WebSocket server */
export const DEFAULT_BB_HUB_PORT = 5100;

/**
 * Central hub state shared between web application and robot services.
 * This interface represents the synchronized state maintained by the basic_bot central hub.
 */
export interface IHubState {
  /** Connection status to the hub (UI only) */
  hubConnStatus?: string;

  /** Hub statistics (see hub_state.py in basic_bot) */
  hub_stats: {
    /** Number of state updates received by the hub */
    state_updates_recv: number;
  };

  /** Array of recognized objects from vision service */
  recognition?: Array<IRecognizedObject>;

  /** System statistics (CPU, RAM, temp) */
  system_stats?: ISystemStats;

  /** Servo motor configuration */
  servo_config?: IServoConfig;

  /** Target servo angles
   *
   * This is a hash of servo names (as defined in
   * servo_config.yml), to target angles in degrees.
   */
  servo_angles?: Record<string, number>;

  /** Actual current servo angles by servo name */
  servo_actual_angles?: Record<string, number>;
}

/**
 * Object detected by computer vision system.
 * Includes classification, confidence score, and bounding box coordinates.
 */
export interface IRecognizedObject {
  /** Object classification label (e.g., "person", "cat", "dog") */
  classification: string;

  /** Detection confidence score (0.0 to 1.0) */
  confidence: number;

  /** Bounding box as [left, top, right, bottom] in pixels */
  bounding_box: [number, number, number, number];
}

/**
 * System resource utilization statistics from the robot.
 */
export interface ISystemStats {
  /** CPU utilization percentage (0-100) */
  cpu_util: number;

  /** CPU temperature in Celsius */
  cpu_temp: number;

  /** RAM utilization percentage (0-100) */
  ram_util: number;

  /** System hostname */
  hostname: string;
}

/**
 * Motor speeds for a two-wheeled robot.
 */
export interface I2WMotorSpeeds {
  /** Left motor speed (-1.0 to 1.0) */
  left: number;

  /** Right motor speed (-1.0 to 1.0) */
  right: number;
}

/**
 * Configuration parameters for a single servo motor.
 */
export interface IServo {
  /** Servo identifier name (e.g., "pan", "tilt") */
  name: string;

  /** Hardware channel number */
  channel: number;

  /** Total range of motion in degrees */
  motor_range: number;

  /** Minimum angle in degrees */
  min_angle: number;

  /** Maximum angle in degrees */
  max_angle: number;

  /** Minimum PWM pulse width in microseconds */
  min_pulse: number;

  /** Maximum PWM pulse width in microseconds */
  max_pulse: number;
}

/**
 * Configuration for multiple servo motors.
 */
export interface IServoConfig {
  /** Array of servo configurations */
  servos: IServo[];
}

/**
 * Default initial state for the hub connection.
 */
export const DEFAULT_HUB_STATE: IHubState = {
  hubConnStatus: "offline",

  // provided by central_hub/
  hub_stats: { state_updates_recv: 0 },
};

const __hub_state: IHubState = { ...DEFAULT_HUB_STATE };
const __hub_port: number = DEFAULT_BB_HUB_PORT;

const onUpdateCallbacks: Array<(state: IHubState) => void> = [];
let hubStatePromises: Array<(state: IHubState) => void> = [];
let lastHubUpdate = Date.now();
let hubMonitor: NodeJS.Timeout | null = null;

/** Active WebSocket connection to the central hub */
export let webSocket: WebSocket | null = null;

/**
 * Options for establishing a connection to the central hub.
 */
export interface ConnectToHubOptions {
  /** WebSocket port number (default: 5100) */
  port?: number;

  /** Initial hub state (default: DEFAULT_HUB_STATE) */
  state?: IHubState;

  /** Automatically reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
}

/**
 * Establishes a WebSocket connection to the basic_bot central hub.
 *
 * Creates a WebSocket connection, registers event handlers, and sets up
 * automatic state synchronization. Optionally enables automatic reconnection
 * on connection loss.
 *
 * @param options - Connection configuration options
 *
 * @example
 * ```typescript
 * connectToHub({
 *   port: 5100,
 *   autoReconnect: true
 * });
 * ```
 */
export function connectToHub({
  port = DEFAULT_BB_HUB_PORT,
  state = DEFAULT_HUB_STATE,
  autoReconnect = true,
}: ConnectToHubOptions) {
  try {
    setHubConnStatus("connecting");
    const hubUrl = `ws://${hubHost}:${port}/ws`;
    console.log(`connecting to central-hub at ${hubUrl}`);
    webSocket = new WebSocket(hubUrl);

    webSocket.addEventListener("open", function () {
      lastHubUpdate = Date.now();

      // we need to wait a bit before sending these messages
      // because websocket is not fully connected yet
      setTimeout(() => {
        webSocket!.send(JSON.stringify({ type: "getState" }));
        webSocket!.send(JSON.stringify({ type: "identity", data: "webapp" }));
        webSocket!.send(JSON.stringify({ type: "subscribeState", data: "*" }));
        setHubConnStatus("online");
        startHubMonitor();
      }, 100);
    });

    webSocket.addEventListener("error", function (event) {
      console.error("got error from central-hub socket", event);
    });

    webSocket.addEventListener("close", function () {
      if (autoReconnect) {
        delayedConnectToHub(state);
      }
    });

    webSocket.addEventListener("message", function (event) {
      lastHubUpdate = Date.now();
      let message = null;
      try {
        message = JSON.parse(event.data);
      } catch (e) {
        console.error("error parsing message from central-hub", e);
        return;
      }
      if (message.type === "pong") {
        return;
      }
      logMessage("got message from central-hub", {
        raw: event.data,
        parsed: message,
      });
      if (message.type === "state" && hubStatePromises.length > 0) {
        hubStatePromises.forEach((p) => p(message.data));
        hubStatePromises = [];
      } else if (message.type === "state" || message.type === "stateUpdate") {
        updateStateFromCentralHub(message.data);
      }
    });
  } catch (e) {
    onConnError(state, e as Error, autoReconnect);
  }
}

function startHubMonitor() {
  stopHubMonitor();
  hubMonitor = setInterval(() => {
    try {
      if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
        stopHubMonitor();
        return;
      }

      // if the socket is hung or there is no network,
      // the websocket will not error out until we send something
      webSocket!.send(JSON.stringify({ type: "ping" }));

      if (
        __hub_state.hubConnStatus === "online" &&
        Date.now() - lastHubUpdate > MIN_HUB_UPDATE_INTERVAL
      ) {
        setHubConnStatus("offline");
      }
    } catch (e) {
      // will get caught by the close if there is a problem
      // but if we send above before while the socket is connecting
      // it will throw a spurious error
      console.error("error pinging central-hub", e);
    }
  }, HUB_PING_INTERVAL);
}

function stopHubMonitor() {
  if (hubMonitor) {
    clearInterval(hubMonitor);
    hubMonitor = null;
  }
}

/**
 * Registers a callback to be invoked whenever hub state is updated.
 *
 * The handler will be called with the complete updated hub state whenever
 * a state update is received from the central hub or when the connection
 * status changes.
 *
 * @param handler - Callback function that receives the updated hub state
 *
 * @example
 * ```typescript
 * addHubStateUpdatedListener((state) => {
 *   console.log('Hub connection:', state.hubConnStatus);
 *   console.log('Recognized objects:', state.recognition);
 * });
 * ```
 */
export function addHubStateUpdatedListener(
  handler: (state: IHubState) => void
) {
  onUpdateCallbacks.push(handler);
}

/**
 * Removes a previously registered hub state update listener.
 *
 * @param handler - The callback function to remove
 */
export function removeHubStateUpdatedListener(
  handler: (state: IHubState) => void
) {
  const index = onUpdateCallbacks.indexOf(handler);
  if (index !== -1) {
    onUpdateCallbacks.splice(index, 1);
  }
}

/**
 * Returns the current local copy of hub state.
 *
 * @returns The current hub state object
 */
export function getLocalState() {
  return __hub_state;
}

/**
 * Requests and returns the current state from the central hub.
 *
 * Sends a "getState" message to the hub and returns a promise that resolves
 * with the hub's response. Use this to get the authoritative state from the hub.
 *
 * @returns Promise that resolves with the hub state
 *
 * @example
 * ```typescript
 * const hubState = await getStateFromCentralHub();
 * console.log('Current servo angles:', hubState.servo_angles);
 * ```
 */
export function getStateFromCentralHub() {
  const statePromise = new Promise<IHubState>((resolve) =>
    hubStatePromises.push(resolve)
  );
  webSocket!.send(JSON.stringify({ type: "getState" }));
  return statePromise;
}

/**
 * Sends a state update to the central hub.
 *
 * Updates will be broadcast to all connected clients and services subscribed
 * to the affected state keys.
 *
 * @param newState - Partial or complete hub state to update
 *
 * @example
 * ```typescript
 * updateSharedState({
 *   servo_angles: { pan: 90, tilt: 45 }
 * });
 * ```
 */
export function updateSharedState(newState: IHubState) {
  webSocket!.send(JSON.stringify({ type: "updateState", data: newState }));
}

function delayedConnectToHub(state: IHubState) {
  setTimeout(() => {
    if (state.hubConnStatus === "offline") {
      connectToHub({ port: __hub_port, state });
    }
  }, 5000);
}

function onConnError(state: IHubState, e: Error, autoReconnect = true) {
  console.error("Connection error; will attempt to reconnnect in 5 seconds", e);
  stopHubMonitor();
  setHubConnStatus("offline");
  if (autoReconnect) {
    delayedConnectToHub(state);
  }
}

// not exported, should only be called from connectToHub
function setHubConnStatus(newStatus: string) {
  logMessage("setting conn status", newStatus);
  __hub_state.hubConnStatus = newStatus;
  emitUpdated();
}

function updateStateFromCentralHub(hubData: IHubState) {
  for (const [key, value] of Object.entries(hubData)) {
    // @ts-expect-error hub state from central hub is not strongly typed
    __hub_state[key] = value;
  }
  emitUpdated();
}

function emitUpdated() {
  for (const callback of onUpdateCallbacks) {
    callback(__hub_state);
  }
}

/**
 * Conditionally logs messages based on debug settings.
 *
 * Only logs when the ?debug=messages query parameter is present.
 * Accepts the same arguments as console.log.
 *
 * @param args - Arguments to pass to console.log
 */
// eslint-disable-next-line
export function logMessage(...args: any[]) {
  if (logMessages) {
    console.log(...args);
  }
}
