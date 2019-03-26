export function mainActivity(pkg: string, url: string) {
    return `
    package ${pkg};

    import android.app.ProgressDialog;
    import android.net.Uri;
    import android.app.Activity;
    import android.os.Bundle;
    import android.webkit.WebSettings;
    import android.webkit.WebView;
    import android.webkit.WebViewClient;
    import android.content.Intent;
    import android.webkit.URLUtil;
    
    public class MainActivity extends Activity {@Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_main);
    
            final WebView webView = (WebView) findViewById(R.id.webView);
            final WebSettings settings = webView.getSettings();
    
            settings.setJavaScriptEnabled(true);
    
            final ProgressDialog progDailog = ProgressDialog.show(this, "Loading", "Please wait...", true);
            progDailog.setCancelable(false);
    
            webView.setWebViewClient(new WebViewClient() {@Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (URLUtil.isNetworkUrl(url)) {
    
                        progDailog.show();
                        view.loadUrl(url);
                    }
                    else {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                    }
                    return true;
                }
    
                @Override
                public void onPageFinished(WebView view, final String url) {
                    progDailog.dismiss();
                }
            });
            webView.loadUrl("${url}");
        }
    }
`
}