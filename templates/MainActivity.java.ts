export function mainActivity(pkg: string, url: string) {
    return `
    package ${pkg};

    import android.app.Activity;
    import android.app.ProgressDialog;
    import android.content.Intent;
    import android.net.Uri;
    import android.os.Bundle;
    import android.view.GestureDetector;
    import android.view.GestureDetector.SimpleOnGestureListener;
    import android.view.KeyEvent;
    import android.view.MotionEvent;
    import android.view.View;
    import android.view.View.OnKeyListener;
    import android.view.View.OnTouchListener;
    import android.webkit.URLUtil;
    import android.webkit.WebSettings;
    import android.webkit.WebView;
    import android.webkit.WebViewClient;
    
    public class MainActivity extends Activity {
    
        @Override
        protected void onCreate(final Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_main);
    
            final WebView webView = (WebView) findViewById(R.id.webView);
            final WebSettings settings = webView.getSettings();
    
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
    
            final ProgressDialog progDailog = ProgressDialog.show(this, "Loading", "Please wait...", true);
            progDailog.setCancelable(false);
    
            final GestureDetector gd = new GestureDetector(this, new SimpleOnGestureListener() {
                @Override
                public boolean onFling(final MotionEvent e1, final MotionEvent e2, final float velocityX,
                        final float velocityY) {
                    try {
                        final float diffY = e2.getY() - e1.getY();
                        final int scroll = webView.getScrollY();
    
                        if (scroll == 0 && diffY > 200)
                            webView.loadUrl(webView.getUrl());
                    } catch (final Exception e) {}
    
                    return false;
                }
            });
    
            webView.setOnKeyListener(new OnKeyListener() {
    
                @Override
                public boolean onKey(final View view, final int keyCode, final KeyEvent e) {
                    if (keyCode == KeyEvent.KEYCODE_BACK) {
                        webView.goBack();
                        return true;
                    }
                    return false;
                }
            });
    
            webView.setOnTouchListener(new OnTouchListener() {
                @Override
                public boolean onTouch(final View view, final MotionEvent e) {
                    return gd.onTouchEvent(e);
                }
            });
    
            webView.setWebViewClient(new WebViewClient() {
    
                @Override
                public void onPageFinished(final WebView view, final String url) {
                    progDailog.dismiss();
                }
    
                @Override
                public boolean shouldOverrideUrlLoading(final WebView view, final String url) {
                    if (URLUtil.isNetworkUrl(url)) {
                        progDailog.show();
                        view.loadUrl(url);
                    } else {
                        final Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                    }
                    return true;
                }
            });
    
            webView.loadUrl("${url}");
        }
    }
`
}