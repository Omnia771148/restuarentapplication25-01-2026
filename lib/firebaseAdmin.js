
import admin from 'firebase-admin';

export function initFirebaseAdmin() {
    if (!admin.apps.length) {
        try {
            console.log("Initializing Firebase Admin...");
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_PRIVATE_KEY;

            console.log("Firebase Env Check details:", {
                hasProjectId: !!projectId,
                hasClientEmail: !!clientEmail,
                hasPrivateKey: !!privateKey,
                privateKeyLength: privateKey ? privateKey.length : 0
            });

            if (!privateKey) {
                throw new Error("FIREBASE_PRIVATE_KEY is missing in environment variables");
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    // Robust handling for newlines in Private Key (Vercel vs Local .env)
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log("Firebase Admin Initialized Successfully");
        } catch (error) {
            console.error("Firebase Admin Initialization Error CRITICAL:", error);
            throw error;
        }
    }
    return admin;
}

// Auto-run init if possible on import, but don't crash if it fails (let initFirebaseAdmin handle it explicitly in API routes)
// Actually, let's NOT auto-run top-level to allow API logic to capture the error in the request context.
// But legacy code might depend on it?
// The only user is send-notification/route.js, which I will update.

export { admin };
