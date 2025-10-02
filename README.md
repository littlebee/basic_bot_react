# basic_bot_react

A collection of React components for basic_bot.

## Installation

```bash
npm install basic_bot_react
```

## Usage

### Simple Usage (Recommended)

Use the `HubStateProvider` to automatically manage hub state and connection:

```tsx
import { HubStateProvider, PanTilt } from "basic_bot_react";

function App() {
    return (
        <HubStateProvider>
            <div className="controls">
                <PanTilt />
            </div>
        </HubStateProvider>
    );
}
```

### Advanced Usage

For more control, you can manually manage state:

```tsx
import { useState, useEffect } from "react";
import { PanTilt } from "basic_bot_react";
import {
    DEFAULT_HUB_STATE,
    connectToHub,
    addHubStateUpdatedListener,
    IHubState,
} from "basic_bot_react";

function App() {
    const [hubState, setHubState] = useState<IHubState>(DEFAULT_HUB_STATE);

    useEffect(() => {
        addHubStateUpdatedListener(handleHubStateUpdated);
        connectToHub();
    }, []);

    const handleHubStateUpdated = (newState: IHubState) => {
        setHubState({ ...newState });
    };

    return (
        <div className="controls">
            <PanTilt
                servoConfig={hubState.servo_config}
                servoAngles={hubState.servo_angles}
                servoActualAngles={hubState.servo_actual_angles}
            />
        </div>
    );
}
```

### Using the useHubState Hook

Access hub state directly in your components:

```tsx
import { HubStateProvider, useHubState } from "basic_bot_react";

function MyComponent() {
    const hubState = useHubState();

    return (
        <div>
            <p>Connection: {hubState.hubConnStatus}</p>
            <p>Pan angle: {hubState.servo_angles?.pan}°</p>
        </div>
    );
}

function App() {
    return (
        <HubStateProvider>
            <MyComponent />
        </HubStateProvider>
    );
}
```


## Documentation

Component and utility function documentation is automatically generated and deployed to GitHub Pages.

[View Documentation](https://littlebee.github.io/basic_bot_react)


