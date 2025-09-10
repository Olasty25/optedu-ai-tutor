import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface AuthDebugProps {
  show?: boolean;
}

export const AuthDebug = ({ show = false }: AuthDebugProps) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    const checkAuthStatus = () => {
      const info = {
        isInitialized: !!auth,
        currentUser: auth.currentUser,
        isSignedIn: !!auth.currentUser,
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId,
        apiKey: auth.app.options.apiKey ? 'Set' : 'Missing',
        environment: {
          NODE_ENV: import.meta.env.NODE_ENV,
          DEV: import.meta.env.DEV,
          PROD: import.meta.env.PROD,
        },
        firebaseConfig: {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing',
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
          appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Set' : 'Missing',
        }
      };
      setDebugInfo(info);
    };

    checkAuthStatus();
    
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkAuthStatus();
    });

    return () => unsubscribe();
  }, []);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        Debug Auth
      </Button>
    );
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="fixed bottom-4 left-4 w-96 max-h-96 overflow-y-auto z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Auth Debug Info</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.isInitialized)}
            <span>Firebase Initialized</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.isSignedIn)}
            <span>User Signed In</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.firebaseConfig?.apiKey === 'Set')}
            <span>API Key</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.firebaseConfig?.authDomain === 'Set')}
            <span>Auth Domain</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(debugInfo.firebaseConfig?.projectId === 'Set')}
            <span>Project ID</span>
          </div>
        </div>
        
        {debugInfo.currentUser && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <div className="font-medium">Current User:</div>
            <div>Email: {debugInfo.currentUser.email}</div>
            <div>UID: {debugInfo.currentUser.uid}</div>
            <div>Provider: {debugInfo.currentUser.providerData[0]?.providerId}</div>
          </div>
        )}
        
        <div className="mt-2 p-2 bg-gray-50 rounded">
          <div className="font-medium">Environment:</div>
          <div>Mode: {debugInfo.environment?.NODE_ENV}</div>
          <div>Dev: {debugInfo.environment?.DEV ? 'Yes' : 'No'}</div>
        </div>
      </CardContent>
    </Card>
  );
};
