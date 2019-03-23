import Koa from 'koa'
import Router from 'koa-router'
import koaStatic from 'koa-static'
import util from 'util'
import urlModule from 'url'
import { manifest } from './templates/AndroidManifest.xml'
import { mainActivity } from './templates/MainActivity.java'
import { layout } from './templates/activity_main.xml'
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'

const mkdir = util.promisify(fs.mkdir)
const writeFile = util.promisify(fs.writeFile)
const symlink = util.promisify(fs.symlink)
const exec = util.promisify(child_process.exec)

const app = new Koa();
const router = new Router()

router.get('/apk/', async ctx => {
    try {
        const { stdout } = await exec('ls')
        const url = ctx.query.url
        const hostname = urlModule.parse(url).hostname as string
        const pkg = hostname.split('.').reverse()
        const man = manifest({
            label: ctx.query.label
            , package: pkg.join('.')
            , versionCode: ctx.query.versionCode
        })

        const build = path.join(__dirname, 'build', Math.random().toString())
        const res = path.join(build, 'res')
        const resLayout = path.join(res, 'layout')
        const src = path.join(build, 'src', ...pkg)

        await mkdir(resLayout, {
            recursive: true
        })

        await mkdir(src, {
            recursive: true
        })

        await symlink(
            path.join(__dirname, 'android.jar')
            , path.join(build, 'android.jar')
        )

        await symlink(
            path.join(__dirname, 'icons')
            , path.join(res, 'drawable')
        )

        await writeFile(
            path.join(build, 'AndroidManifest.xml')
            , man
        )

        await writeFile(
            path.join(resLayout, 'activity_main.xml')
            , layout()
        )

        await writeFile(
            path.join(src, 'MainActivity.java')
            , mainActivity(url)
        )

        await exec(
            'aapt package -f -m -J src -M AndroidManifest.xml -S res -I android.jar'
            , { cwd: build }
        )
        await exec(
            `javac -cp src ${src}/*.java -bootclasspath android.jar -d bin`
            , { cwd: build }
        )
        await exec(
            'tools/dx --dex --output=classes.dex bin'
            , { cwd: build }
        )
        await exec(
            'aapt package -f -m -F output.apk -M AndroidManifest.xml -S res -I android.jar'
            , { cwd: build }
        )
        await exec(
            'aapt add output.apk classes.dex'
            , { cwd: build }
        )
        await exec(
            'tools/apksigner sign --ks mykey.keystore -ks-pass pass:123456 output.apk'
            , { cwd: build }
        )


        ctx.type = 'text'
        ctx.body = build
    } catch (err) {
        ctx.body = err
    }
})


app.use(koaStatic('s'))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8080)
