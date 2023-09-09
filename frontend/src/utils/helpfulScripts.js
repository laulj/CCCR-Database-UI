import * as React from 'react';

// Custom interval hook
function useInterval(callback, delay) {
    const savedCallback = React.useRef();

    React.useEffect(() => {
        savedCallback.current = callback;
    });

    React.useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        let id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

export { useInterval };