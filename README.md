# basic_bot_react

A collection of React components for basic_bot.

## Installation

```bash
npm install basic_bot_react
```

## Usage

```tsx
import { useState, useEffect } from "react";
import { PanTilt } from "basic_bot_react";
import {
    DEFAULT_HUB_STATE,
    connectToHub,
    addHubStateUpdatedListener,
    IHubState,
} from "basic_bot_react/util/hubState"

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
                servoActualAngles={
                    hubState.servo_actual_angles
                }
            />
        </div>
    )
}

```


## Documentation

Component and utility function documentation is automatically generated and deployed to GitHub Pages.

[View Documentation](https://littlebee.github.io/basic_bot_react)


