import ping from 'ping';
import pLimit from 'p-limit';

export class LinkMonitor {
    constructor(io, options = {}) {
        this.io = io;
        this.links = new Map(); // linkId -> url
        this.isRunning = false;
        this.interval = null;
        this.devMode = process.env.DEV_MODE === 'true';

        // Configuration
        this.pingInterval = options.interval || 2000; // 2 seconds
        this.timeout = options.timeout || 2; // 2 seconds for ping
        this.concurrency = options.concurrency || 20;
        this.limit = pLimit(this.concurrency);

        // Dev mode state
        this.lastLatency = new Map();
    }

    extractHostname(url) {
        try {
            // Remove protocol
            let hostname = url.replace(/^https?:\/\//, '');
            // Remove path
            hostname = hostname.split('/')[0];
            // Remove port
            hostname = hostname.split(':')[0];
            return hostname;
        } catch {
            return url;
        }
    }

    async pingLink(linkId, url) {
        if (this.devMode) {
            return this.generateFakeLatency(linkId);
        }

        const hostname = this.extractHostname(url);

        try {
            const res = await ping.promise.probe(hostname, {
                timeout: this.timeout,
                min_reply: 1
            });

            if (res.alive) {
                // Parse latency from ping output
                const latency = parseFloat(res.time) || parseFloat(res.avg) || 0;

                return {
                    linkId,
                    latency: Math.round(latency),
                    status: latency > 300 ? 'slow' : latency > 100 ? 'slow' : 'online',
                    timestamp: Date.now()
                };
            } else {
                return {
                    linkId,
                    latency: 0,
                    status: 'offline',
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            console.error(`[LinkMonitor] Ping failed for ${hostname}:`, error.message);
            return {
                linkId,
                latency: 0,
                status: 'offline',
                timestamp: Date.now()
            };
        }
    }

    generateFakeLatency(linkId) {
        // Random walk algorithm for realistic latency simulation
        const prev = this.lastLatency.get(linkId) || 50;
        const delta = Math.random() * 26 - 10; // -10 to +16ms
        let latency = Math.max(10, Math.min(2000, prev + delta));

        // Simulate random spikes (5% chance)
        if (Math.random() < 0.05) {
            latency = Math.random() * 1500 + 500;
        }

        // Simulate offline state (2% chance)
        const isOffline = Math.random() < 0.02;
        const status = isOffline ? 'offline' :
            latency > 1000 ? 'slow' : 'online';

        this.lastLatency.set(linkId, latency);

        return {
            linkId,
            latency: isOffline ? 0 : Math.round(latency),
            status,
            timestamp: Date.now()
        };
    }

    async processBatch() {
        if (this.links.size === 0) return;

        const linkArray = Array.from(this.links.entries());

        // Process with concurrency limit
        const results = await Promise.all(
            linkArray.map(([id, url]) =>
                this.limit(() => this.pingLink(id, url))
            )
        );

        // Emit to all connected clients
        this.io.emit('latency_update', results);
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        const mode = this.devMode ? 'DEV MODE' : 'LIVE';
        console.log(`[LinkMonitor] Started (${mode}) - ${this.links.size} links`);

        // Run immediately
        this.processBatch();

        // Then run on interval
        this.interval = setInterval(() => {
            this.processBatch();
        }, this.pingInterval);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log('[LinkMonitor] Stopped');
    }

    updateLinks(links) {
        this.links.clear();
        links.forEach(link => {
            this.links.set(link.id, link.url);
        });
        console.log(`[LinkMonitor] Monitoring ${this.links.size} links`);
    }

    destroy() {
        this.stop();
        this.links.clear();
        this.lastLatency.clear();
    }
}
