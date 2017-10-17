const {app, BrowserWindow, ipcMain, globalShortcut, shell} = require("electron")
const path = require("path")
const isDev = require("electron-is-dev")
const {autoUpdater} = require("electron-updater")
const Telegraf = require("telegraf")
const secrets = require("./secret.js")
const child_process = require("child_process")
const AutoLaunch = require("auto-launch")
const authorizedUsers = []
const bot = new Telegraf(secrets.token)
let mainWindow
let telegram
app.commandLine.appendSwitch("disable-web-security")
if (isDev) {
    const AutoLauncher = new AutoLaunch({name: "John"})
    AutoLauncher.isEnabled()
        .then(function(isEnabled) {
            if (isEnabled) {
                return
            }
            AutoLauncher.enable()
        })
        .catch(function(err) {
            console.log(err)
        })
}

// TELEGRAM
bot.command("start", ctx => {
    telegram = ctx.telegram
    if (authorizedUsers.indexOf(ctx.from.id) !== -1) {
        return reply("you are already authorized")
    } else {
        mainWindow.webContents.send("authorizationRequest", ctx.from)
    }
})
bot.command("shutdown", ({from, reply}) => {
    if (authorizedUsers.indexOf(ctx.from.id) !== -1) {
        reply("Shutting down")
        child_process.spawn("shutdown /s /t 30", {shell: true})
    } else {
        reply("You are not authorized, run the command /start first")
    }
})
bot.startPolling()

ipcMain.on("authorizeUser", (event, user) => {
    authorizedUsers.push(user)
    telegram.sendMessage(user, "You've been authorized!")
})

ipcMain.on("unauthorizeUser", (event, user) => {
    telegram.sendMessage(user, "Your request has been rejected")
})

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 50,
        alwaysOnTop: true,
        skipTaskbar: true,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            webSecurity: false,
        },
    })
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    ) // load the react app
    mainWindow.on("closed", () => (mainWindow = null))
    mainWindow.on("blur", () => {
        mainWindow.webContents.send("clearInput")
        mainWindow.hide()
    })
    const pos = mainWindow.getPosition()
    mainWindow.setPosition(pos[0], 150)

    // intercept link opening
    mainWindow.webContents.on("new-window", function(event, url) {
        event.preventDefault()
        shell.openExternal(url)
    })

    mainWindow.hide()
}

// when the app is loaded create a BrowserWindow and check for updates
app.on("ready", function() {
    createWindow()
    if (!isDev) autoUpdater.checkForUpdates()

    // Register a 'Ctrl+Q' shortcut listener.
    const ret = globalShortcut.register("Ctrl+Q", () => {
        if (mainWindow.isVisible()) {
            mainWindow.webContents.send("clearInput")
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
    })
})

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on("update-downloaded", info => {
    mainWindow.webContents.send("updateReady")
})

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall()
})

ipcMain.on("quit", (event, arg) => {
    app.quit()
})

app.on("will-quit", () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})
