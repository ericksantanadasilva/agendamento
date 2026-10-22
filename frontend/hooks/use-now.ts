import * as React from "react";

export function useNow(intervalMs = 30_000): number {
    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [intervalMs]);

    return now;
}