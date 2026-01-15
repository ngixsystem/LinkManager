import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface LatencyData {
    linkId: string;
    latency: number;
    status: 'online' | 'slow' | 'offline';
    timestamp: number;
}

interface LinkMonitorContextType {
    isEnabled: boolean;
    toggleMonitoring: (enabled: boolean) => void;
    updateLinks: (links: Array<{ id: string; url: string }>) => void;
    getHistory: (linkId: string) => LatencyData[];
    getCurrent: (linkId: string) => LatencyData | null;
}

const LinkMonitorContext = createContext<LinkMonitorContextType | null>(null);

const SOCKET_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;

export function LinkMonitorProvider({ children }: { children: ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(() => {
        return localStorage.getItem('link_monitoring_enabled') === 'true';
    });

    const socketRef = useRef<Socket | null>(null);
    const [history, setHistory] = useState<Map<string, LatencyData[]>>(new Map());
    const isVisibleRef = useRef(true);

    // Page Visibility API - pause when tab is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;

            if (socketRef.current && isEnabled) {
                if (document.hidden) {
                    socketRef.current.emit('stop_monitoring');
                    console.log('[Monitor] Paused (tab hidden)');
                } else {
                    socketRef.current.emit('start_monitoring');
                    console.log('[Monitor] Resumed (tab visible)');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isEnabled]);

    // WebSocket connection management
    useEffect(() => {
        localStorage.setItem('link_monitoring_enabled', String(isEnabled));

        if (isEnabled) {
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket', 'polling']
            });

            socketRef.current.on('connect', () => {
                console.log('[Monitor] Connected');
                if (isVisibleRef.current) {
                    socketRef.current?.emit('start_monitoring');
                }
            });

            socketRef.current.on('latency_update', (updates: LatencyData[]) => {
                setHistory(prev => {
                    const next = new Map(prev);
                    updates.forEach(update => {
                        const current = next.get(update.linkId) || [];
                        const updated = [...current, update].slice(-30); // Keep last 30 points
                        next.set(update.linkId, updated);
                    });
                    return next;
                });
            });

            socketRef.current.on('disconnect', () => {
                console.log('[Monitor] Disconnected');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('[Monitor] Connection error:', error);
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setHistory(new Map()); // Clear history when disabled
        }
    }, [isEnabled]);

    const toggleMonitoring = (enabled: boolean) => {
        setIsEnabled(enabled);
    };

    const updateLinks = (links: Array<{ id: string; url: string }>) => {
        if (socketRef.current && isEnabled) {
            socketRef.current.emit('update_links', links);
            console.log('[Monitor] Updated links:', links.length);
        }
    };

    const getHistory = (linkId: string): LatencyData[] => {
        return history.get(linkId) || [];
    };

    const getCurrent = (linkId: string): LatencyData | null => {
        const linkHistory = history.get(linkId);
        return linkHistory && linkHistory.length > 0
            ? linkHistory[linkHistory.length - 1]
            : null;
    };

    return (
        <LinkMonitorContext.Provider value={{ isEnabled, toggleMonitoring, updateLinks, getHistory, getCurrent }}>
            {children}
        </LinkMonitorContext.Provider>
    );
}

export function useMonitoring() {
    const context = useContext(LinkMonitorContext);
    if (!context) {
        throw new Error('useMonitoring must be used within LinkMonitorProvider');
    }
    return context;
}
