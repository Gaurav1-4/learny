"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pushToFirestore } from "@/lib/firebase/firestore-sync";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found in environment variables");
      }
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      setSubscription(sub);
      
      // Send subscription to server
      await pushToFirestore({ pushSubscription: JSON.stringify(sub) });
      
      setMessage("Notifications enabled!");
    } catch (error: any) {
      console.error("Push subscription failed:", error);
      setMessage(error?.message || "Failed to enable notifications");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function unsubscribeFromPush() {
    setLoading(true);
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      // In a real app, you should also delete it from your database here
      setMessage("Notifications disabled.");
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      setMessage(error?.message || "Failed to disable notifications");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function sendTestNotification() {
    setLoading(true);
    try {
      await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
      setMessage("Test notification sent!");
    } catch (error: any) {
      setMessage(error?.message || "Failed to send test notification");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  if (!isSupported) {
    return (
      <div className="text-xs text-zinc-500 flex items-center gap-2">
        <BellOff className="h-4 w-4" />
        Push notifications are not supported in this browser. Install as PWA first.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            {subscription ? <Bell className="h-4 w-4 text-purple-400" /> : <BellOff className="h-4 w-4 text-zinc-400" />}
            Push Notifications
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {subscription 
              ? "You are subscribed to receive push notifications on this device."
              : "Enable push notifications to receive real-time Classroom updates."}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {subscription ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={sendTestNotification}
                disabled={loading}
                className="text-xs"
              >
                Test Push
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={unsubscribeFromPush}
                disabled={loading}
                className="text-xs"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Disable
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              onClick={subscribeToPush}
              disabled={loading}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Enable Notifications
            </Button>
          )}
        </div>
      </div>
      
      {message && (
        <p className="text-xs text-purple-400 font-medium animate-in fade-in">
          {message}
        </p>
      )}
    </div>
  );
}
