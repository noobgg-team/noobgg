"use client"
import React, { useState } from 'react';

type NotificationType = 'friend_request' | 'info';

interface Notification {
  id: string;
  message: string;
  date: Date;
  isRead: boolean;
  type: NotificationType;
  fromUser?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'Logged into the system', date: new Date(), isRead: false, type: 'info' },
    { id: '2', message: 'You have a new message', date: new Date(), isRead: false, type: 'info' },
    { id: '3', message: 'Update completed successfully', date: new Date(), isRead: true, type: 'info' },
    { id: '4', message: 'Friend request from Alice', date: new Date(), isRead: false, type: 'friend_request', fromUser: 'Alice' },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  function markAsRead(id: string) {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }

  function clearAll() {
    setNotifications([]);
  }

  function acceptFriendRequest(id: string) {
    alert('Friend request accepted!');
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function rejectFriendRequest(id: string) {
    alert('Friend request rejected!');
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="overflow-y-auto rounded-md shadow-lg
      bg-white text-gray-900
      dark:bg-gray-800 dark:text-gray-200
      border border-gray-300 dark:border-gray-700
      z-50">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center font-semibold text-lg">
        <span>
          Notifications {unreadCount > 0 && <span className="ml-2 bg-red-600 text-white rounded-full px-2 text-sm">{unreadCount}</span>}
        </span>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            disabled={notifications.length === 0}
            title="Mark all as read"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            disabled={notifications.length === 0}
            title="Clear all notifications"
          >
            Clear all
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No new notifications</div>
      ) : (
        <ul>
          {notifications.map(({ id, message, date, isRead, type, fromUser }) => (
            <li
              key={id}
              className={`px-4 py-3 border-b last:border-0
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${isRead ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900 font-semibold'}
              `}
            >
              {type === 'friend_request' ? (
                <>
                  <p>{fromUser} sent you a friend request</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => acceptFriendRequest(id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p onClick={() => markAsRead(id)} className="cursor-pointer">{message}</p>
                  <time className="text-xs text-gray-400 dark:text-gray-400">{date.toLocaleString()}</time>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
