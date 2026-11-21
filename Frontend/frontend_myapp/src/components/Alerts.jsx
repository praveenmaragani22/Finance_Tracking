import { useState, useEffect } from 'react';
import { getAlertsData } from '../Api';

function Alerts() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await getAlertsData();
                const data = Array.isArray(response.data) ? response.data : [];
                setNotifications(data);
            } catch (err) {
                console.error('Error fetching alerts:', err);
                setError('Unable to load alerts. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') {
            return !notification.read;
        }

        if (filter === 'read') {
            return notification.read;
        }

        return true;
    });

    function markAsRead(id) {
        setNotifications(notifications.map(notification =>
            notification.id === id
                ? { ...notification, read: true }
                : notification
        ));
    }

    function markAllAsRead() {
        setNotifications(notifications.map(notification => ({
            ...notification,
            read: true
        })));
    }

    function deleteNotification(id) {
        setNotifications(notifications.filter(
            notification => notification.id !== id
        ));
    }

    function deleteAllNotifications() {
        if (window.confirm('Delete all notifications?')) {
            setNotifications([]);
        }
    }

    const getSeverityBadge = (severity) => {
        if (severity === 'danger') {
            return {
                label: 'CRITICAL',
                bg: '#fee2e2',
                color: '#dc2626',
                border: '#fecaca'
            };
        }
        if (severity === 'warning') {
            return {
                label: 'WARNING',
                bg: '#fef3c7',
                color: '#d97706',
                border: '#fde68a'
            };
        }
        if (severity === 'success') {
            return {
                label: 'SUCCESS',
                bg: '#d1fae5',
                color: '#059669',
                border: '#a7f3d0'
            };
        }
        return {
            label: 'INFO',
            bg: '#e0f2fe',
            color: '#0284c7',
            border: '#bae6fd'
        };
    };

    return (

        <div className="alerts">

            <div className="alerts-header">

                <div>
                    <h1>Alerts & Notifications</h1>
                    <p>Stay informed about your financial activities.</p>
                </div>

                <span className="unread-count">
                    {unreadCount} Unread
                </span>

            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    fontSize: '13px'
                }}>
                    {error}
                </div>
            )}

            <div className="alerts-toolbar">

                <div className="alert-filters">

                    <button
                        type="button"
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </button>

                    <button
                        type="button"
                        className={filter === 'unread' ? 'active' : ''}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>

                    <button
                        type="button"
                        className={filter === 'read' ? 'active' : ''}
                        onClick={() => setFilter('read')}
                    >
                        Read ({notifications.length - unreadCount})
                    </button>

                </div>

                <div className="alert-actions">

                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </button>

                    <button
                        type="button"
                        onClick={deleteAllNotifications}
                        disabled={notifications.length === 0}
                    >
                        Clear all
                    </button>

                </div>

            </div>

            {loading ? (

                <div style={{ padding: '40px', textAlign: 'center', color: '#8492a6' }}>
                    Checking financial alerts...
                </div>

            ) : filteredNotifications.length === 0 ? (

                <div className="alerts-empty-state">

                    <div className="empty-state-icon">♧</div>

                    <h3>No Notifications Found</h3>

                    <p>
                        {filter === 'unread'
                            ? 'You have read all your notifications!'
                            : 'Your financial alerts and notifications will appear here.'}
                    </p>

                </div>

            ) : (

                <div className="notification-list">

                    {filteredNotifications.map(notification => {
                        const badge = getSeverityBadge(notification.severity);

                        return (

                            <div
                                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                                key={notification.id}
                                style={{
                                    borderLeft: notification.severity === 'danger'
                                        ? '4px solid #dc2626'
                                        : notification.severity === 'warning'
                                            ? '4px solid #f59e0b'
                                            : notification.severity === 'success'
                                                ? '4px solid #10b981'
                                                : '4px solid #3b82f6'
                                }}
                            >

                                <div className={`notification-icon ${notification.type}`}>
                                    {notification.type === 'budget' && '₹'}
                                    {notification.type === 'goal' && '◎'}
                                    {notification.type === 'transaction' && '↔'}
                                    {notification.type === 'general' && 'i'}
                                </div>

                                <div className="notification-content">

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3 style={{ margin: 0 }}>{notification.title}</h3>
                                        {notification.severity && (
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                padding: '2px 7px',
                                                borderRadius: '4px',
                                                backgroundColor: badge.bg,
                                                color: badge.color,
                                                border: `1px solid ${badge.border}`,
                                                letterSpacing: '0.5px'
                                            }}>
                                                {badge.label}
                                            </span>
                                        )}
                                    </div>

                                    <p>{notification.message}</p>

                                    <span>{notification.date}</span>

                                </div>

                                <div className="notification-actions">

                                    {!notification.read && (
                                        <button
                                            type="button"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            Mark read
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => deleteNotification(notification.id)}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default Alerts;
