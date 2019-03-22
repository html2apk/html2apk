import Koa from 'koa'
import Router from 'koa-router'
import koaStatic from 'koa-static'
import util from 'util'
import urlModule from 'url'
import { manifest } from './templates/AndroidManifest.xml'
import { mainActivity } from './templates/MainActivity.java';
import { layout } from './templates/activity_main.xml';
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'

const mkdir = util.promisify(fs.mkdir)
const writeFile = util.promisify(fs.writeFile)
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
        const main = mainActivity(url)
        const activityMain = layout()
        const tmp = path.join('/tmp', Math.random().toString())
        const src = path.join(tmp, 'src', ...pkg)
        await mkdir(src, {
            recursive: true
        })
        await writeFile(
            path.join(tmp, 'AndroidManifest.xml')
            , man
        )
        await writeFile(
            path.join(src, 'MainActivity.java')
            , mainActivity
        )
        ctx.type = 'text'
        ctx.body = tmp
    } catch (err) {
        ctx.body = err
    }
})


app.use(koaStatic('s'))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8080)
