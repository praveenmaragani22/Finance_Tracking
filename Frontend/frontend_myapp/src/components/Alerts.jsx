
import { useState } from 'react';

function Alerts() {

    const [notifications, setNotifications] = useState([]);

    const [filter, setFilter] = useState('all');

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

            <div className="alerts-toolbar">

                <div className="alert-filters">

                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>

                    <button
                        className={filter === 'unread' ? 'active' : ''}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </button>

                    <button
                        className={filter === 'read' ? 'active' : ''}
                        onClick={() => setFilter('read')}
                    >
                        Read
                    </button>

                </div>

                <div className="alert-actions">

                    <button onClick={markAllAsRead}>
                        Mark all as read
                    </button>

                    <button onClick={deleteAllNotifications}>
                        Clear all
                    </button>

                </div>

            </div>

            {filteredNotifications.length === 0 ? (

                <div className="alerts-empty-state">

                    <div className="empty-state-icon">♧</div>

                    <h3>No Notifications Yet</h3>

                    <p>
                        Your financial alerts and notifications will appear here.
                    </p>

                </div>

            ) : (

                <div className="notification-list">

                    {filteredNotifications.map(notification => (

                        <div
                            className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                            key={notification.id}
                        >

                            <div className={`notification-icon ${notification.type}`}>
                                {notification.type === 'budget' && '₹'}
                                {notification.type === 'goal' && '◎'}
                                {notification.type === 'transaction' && '↔'}
                                {notification.type === 'general' && 'i'}
                            </div>

                            <div className="notification-content">

                                <h3>{notification.title}</h3>

                                <p>{notification.message}</p>

                                <span>{notification.date}</span>

                            </div>

                            <div className="notification-actions">

                                {!notification.read && (
                                    <button onClick={() => markAsRead(notification.id)}>
                                        Mark read
                                    </button>
                                )}

                                <button onClick={() => deleteNotification(notification.id)}>
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Alerts;
