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
const copyFile = util.promisify(fs.copyFile)
const readFile = util.promisify(fs.readFile)
const exec = util.promisify(child_process.exec)

const app = new Koa();
const router = new Router()

router.get('/apk/', async ctx => {
    const build = path.join(__dirname, 'build', Math.random().toString())
    try {
        const url = ctx.query.url
        const hostname = urlModule.parse(url).hostname as string
        const pkg = hostname.split('.').reverse()
        const icon = ctx.query.icon
        const man = manifest({
            label: ctx.query.label
            , package: pkg.join('.')
            , versionCode: ctx.query.versionCode
            , icon: icon
        })

        const dir: { [name: string]: string } = {
            layout: path.join(build, 'res', 'layout')
            , drawable: path.join(build, 'res', 'drawable')
            , src: path.join(build, 'src', ...pkg)
            , bin: path.join(build, 'bin')
        }

        for (const k in dir) {
            await mkdir(dir[k], {
                recursive: true
            })
        }

        await symlink(
            path.join(__dirname, 'android.jar')
            , path.join(build, 'android.jar')
        )

        await symlink(
            path.join(__dirname, 'tools')
            , path.join(build, 'tools')
        )

        await symlink(
            path.join(__dirname, 'mykey.keystore')
            , path.join(build, 'mykey.keystore')
        )

        await copyFile(
            path.join(__dirname, 'png', `${icon}.png`)
            , path.join(dir.drawable, `${icon}.png`)
        )

        await writeFile(
            path.join(build, 'AndroidManifest.xml')
            , man
        )

        await writeFile(
            path.join(dir.layout, 'activity_main.xml')
            , layout()
        )

        await writeFile(
            path.join(dir.src, 'MainActivity.java')
            , mainActivity(pkg.join('.'), url)
        )

        await exec(
            'tools/aapt package -f -m -J src -M AndroidManifest.xml -S res -I android.jar'
            , { cwd: build }
        )
        await exec(
            `javac -cp src ${dir.src}/*.java -bootclasspath android.jar -d bin`
            , { cwd: build }
        )
        await exec(
            'tools/dx --dex --output=classes.dex bin'
            , { cwd: build }
        )
        await exec(
            'tools/aapt package -f -m -F tmp.apk -M AndroidManifest.xml -S res -I android.jar'
            , { cwd: build }
        )
        await exec(
            'tools/aapt add tmp.apk classes.dex'
            , { cwd: build }
        )
        await exec(
            'tools/zipalign -f 4 tmp.apk final.apk'
            , { cwd: build }
        )
        await exec(
            'tools/apksigner sign --ks mykey.keystore -ks-pass pass:123456 final.apk'
            , { cwd: build }
        )


        ctx.type = 'application/vnd.android.package-archive'
        const apk = await readFile(path.join(build, 'final.apk'))
        ctx.body = apk
    } catch (err) {
        err.cwd = build
        ctx.body = err
    }
})


app.use(koaStatic('s'))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8080)
