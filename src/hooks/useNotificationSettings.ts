
import { useState, useEffect } from 'react';

export const useNotificationSettings = () => {
  const [mainNotificationsMuted, setMainNotificationsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('mainNotificationsMuted');
    return saved ? JSON.parse(saved) : false;
  });

  const [tarotNotificationsMuted, setTarotNotificationsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('tarotNotificationsMuted');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('mainNotificationsMuted', JSON.stringify(mainNotificationsMuted));
  }, [mainNotificationsMuted]);

  useEffect(() => {
    localStorage.setItem('tarotNotificationsMuted', JSON.stringify(tarotNotificationsMuted));
  }, [tarotNotificationsMuted]);

  const toggleMainNotifications = () => {
    setMainNotificationsMuted(prev => !prev);
  };

  const toggleTarotNotifications = () => {
    setTarotNotificationsMuted(prev => !prev);
  };

  return {
    mainNotificationsMuted,
    tarotNotificationsMuted,
    toggleMainNotifications,
    toggleTarotNotifications,
  };
};
