import { NextResponse } from "next/server";
import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@learny.zorx.tech";

// Ensure keys are set
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription provided" },
        { status: 400 }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "VAPID keys are not configured on the server." },
        { status: 500 }
      );
    }

    // Prepare a test payload
    const payload = JSON.stringify({
      title: "Learny OS Sync",
      body: "Push notifications are working perfectly on your iPhone!",
      icon: "/icon-192.png",
      url: "/dashboard",
    });

    // Send the push
    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: "Failed to send push notification", details: error.message },
      { status: 500 }
    );
  }
}
