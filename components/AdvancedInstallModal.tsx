import React from 'react';
import { CloseIcon } from './Icons';

const CodeBlock: React.FC<{ language: string; children: React.ReactNode }> = ({ language, children }) => (
  <pre className="bg-gray-800 text-white rounded-lg p-4 my-2 text-sm overflow-x-auto">
    <code className={`language-${language}`}>{children}</code>
  </pre>
);

const AdvancedInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="advanced-install-title">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 id="advanced-install-title" className="text-2xl font-bold text-center text-gray-800">Advanced: Build a Native Android APK</h2>
          <p className="text-center text-gray-500 mt-1">For developers who want to wrap the web app in a native shell.</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close instructions">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          <p className="text-sm bg-yellow-100 text-yellow-800 p-3 rounded-lg">
            <strong>Note:</strong> These instructions require <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Android Studio</a> and basic knowledge of native Android development. The easiest way for most users to install this app is via the PWA "Add to Home Screen" feature.
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Step 1: Set Up a New Android Studio Project</h3>
            <p>Create a new project in Android Studio with an "Empty Views Activity".</p>

            <h3 className="text-lg font-semibold text-gray-700">Step 2: Add Internet Permission</h3>
            <p>Add the `INTERNET` permission to your `app/src/main/AndroidManifest.xml` file:</p>
            <CodeBlock language="xml">{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.mywebapp">

    <uses-permission android:name="android.permission.INTERNET" />

    <application ...>
        ...
    </application>

</manifest>`}</CodeBlock>

            <h3 className="text-lg font-semibold text-gray-700">Step 3: Create the WebView Layout</h3>
            <p>Replace the content of `app/src/main/res/layout/activity_main.xml` with a WebView:</p>
            <CodeBlock language="xml">{`<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</RelativeLayout>`}</CodeBlock>

            <h3 className="text-lg font-semibold text-gray-700">Step 4: Write the App Logic</h3>
            <p>Replace the content of `MainActivity.kt`. Remember to set your web app's URL.</p>
            <CodeBlock language="kotlin">{`package com.example.mywebapp

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)

        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true

        webView.webViewClient = WebViewClient()

        // IMPORTANT: Replace with your web app's actual URL
        webView.loadUrl("https://<YOUR_APP_URL_HERE>")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`}</CodeBlock>

            <h3 className="text-lg font-semibold text-gray-700">Step 5: Generate a Signed App Bundle (AAB)</h3>
            <p>From the Android Studio menu, select <strong>Build &gt; Generate Signed Bundle / APK...</strong>. For publishing on the Google Play Store, it is highly recommended to build an <strong>Android App Bundle (.aab)</strong>. Follow the on-screen wizard to create a new key store and generate the signed bundle.</p>
            
            <h3 className="text-lg font-semibold text-gray-700">Step 6: Publish on the Google Play Store</h3>
            <p>Once you have your signed App Bundle (.aab), you can publish it:</p>
            <ol className="space-y-3 list-decimal list-inside text-gray-600">
              <li>
                <strong>Create a Developer Account:</strong> You'll need a Google Play Developer account, which has a one-time registration fee. Sign up at the <a href="https://play.google.com/console/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Play Console</a>.
              </li>
              <li>
                <strong>Create Your App Listing:</strong> In the Play Console, create a new app. You'll need to provide details like the app's name, description, screenshots, an app icon, and a privacy policy.
              </li>
              <li>
                <strong>Upload Your App Bundle:</strong> Upload the signed .aab file you generated in the previous step to your app's release track.
              </li>
              <li>
                <strong>Roll Out:</strong> Follow the steps to review and roll out your release. Google will review your app before it goes live on the Play Store.
              </li>
            </ol>
            <p>For detailed, official instructions, refer to the <a href="https://developer.android.com/studio/publish" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Android Developer guide on publishing</a>.</p>

          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t text-right">
             <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInstallModal;