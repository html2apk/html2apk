import Koa from 'koa'
import Router from 'koa-router'
import koaStatic from 'koa-static'

const app = new Koa();
const router = new Router()

router.get('/:img/:title/:description/:msg/', html)

function html(ctx: Koa.ParameterizedContext) {
}

app.use(koaStatic('s'))
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(8080, '0.0.0.0');
