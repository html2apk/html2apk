import Koa from 'koa'
import Router from 'koa-router'
import koaStatic from 'koa-static'
import util from 'util'
import url from 'url'
import { manifest } from './templates/AndroidManifest.xml'
const exec = util.promisify(require('child_process').exec)

const app = new Koa();
const router = new Router()

router.get('/apk/', async ctx => {
    try {
        const { stdout } = await exec('ls')
        const uri = ctx.query.url
        const hostname = url.parse(uri).hostname as string
        ctx.type = 'text'
        ctx.body = manifest({
            label: ctx.query.label
            , package: hostname.split('.').reverse().join('.')
            , versionCode: ctx.query.versionCode
        })
    } catch (err) {
        ctx.body = err
    }
})


app.use(koaStatic('s'))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8080)
