export function mainActivity(url: string) {
    return `
package com.funkymsg;

import android.net.Uri;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Intent;
import android.webkit.URLUtil;

public class MainActivity extends Activity {
   @Override
   protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_main);

      final WebView webView = (WebView) findViewById(R.id.webView);
      final WebSettings settings = webView.getSettings();

      settings.setJavaScriptEnabled(true);

      webView.setWebViewClient(new WebViewClient() {
         @Override
         public boolean shouldOverrideUrlLoading(WebView view, String url) {
             if( URLUtil.isNetworkUrl(url) ) 
                 return false;
         
                 Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                 startActivity( intent );
             return true;
         }
 
     });
      webView.loadUrl("${url}");
   }
}
`
}