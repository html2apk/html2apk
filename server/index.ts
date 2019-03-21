import Koa from 'koa'
import Router from 'koa-router'
import koaStatic from 'koa-static'
import util from 'util'
const exec = util.promisify(require('child_process').exec);

const app = new Koa();
const router = new Router()

router.get('/apk/', async ctx => {
    const { stdout, stderr } = await exec('ls');
    ctx.body = stdout
})


app.use(koaStatic('s'))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8080, '0.0.0.0');
