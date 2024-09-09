const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const debug = require("debug")("hookhub:app")

const hooks = require("express-middleware-module-loader")("./hooks/")

const index = require("./routes/index")(hooks)

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"))

// Intercept req.rawBody
app.use(
    bodyParser.json({
        verify: function (req, res, buf, encoding) {
            // get rawBody
            req.rawBody = buf.toString(encoding)

            debug("rawBody:", req.rawBody)
        }
    })
)
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use("/", index)

app.use("/hooks", hooks)

app.get("/dump", function (req, res, next) {
    debug("Registered routes:")
    debug("========================================")
    app._router.stack.forEach(function (r) {
        debug("r:", r)
    })
    debug("========================================")
    res.send({
        result: "OK"
    })
})

// catch 404 and forward to error handler
debug("Adding 404")
app.use(function (req, res, next) {
    const err = new Error("Not Found")
    next({ ...err, status: 404 })
})

// error handler
debug("Adding error handler")
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render("error")
})

module.exports = app
