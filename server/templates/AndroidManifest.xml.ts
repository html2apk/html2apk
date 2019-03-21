export type info = {
    package: string
    versionCode: number
    label: string
}

export function manifest(info: info) {
    return `
<manifest
    xmlns:a='http://schemas.android.com/apk/res/android' 
    package='${info.package}' 
    a:versionCode='${info.versionCode}' 
    a:versionName='0'>

    <uses-permission a:name="android.permission.INTERNET"/>

    <uses-sdk a:minSdkVersion="15"
          a:targetSdkVersion="28"
          a:maxSdkVersion="28" />

    <application a:label='${info.label}' 
        a:icon="@drawable/icon">
        <activity a:name='${info.package}.MainActivity'>
            <intent-filter>
                <category a:name='android.intent.category.LAUNCHER'/>
                <action a:name='android.intent.action.MAIN'/>
            </intent-filter>
        </activity>
    </application>
</manifest>
`
}