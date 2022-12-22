const { app, BrowserWindow, ipcMain, desktopCapturer, screen, shell } = require('electron');
const path = require('path');
let fs = require('fs')
let jimp = require('jimp')
let moment = require('moment')
var child = require('child_process').execFile;
var executablePath = "./main.exe";

const mediaPath = path.join(__dirname + '/renderer/media/snippets')
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1020,
        height: 600,
        minWidth: 1020,
        minHeight: 600,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    let regionWindow;
    let drawingWindow;

    const displays = screen.getAllDisplays()
    let externalDisplay = displays.map((display) => {
        return display.size
    })
    externalDisplay = externalDisplay[0]

    win.loadFile('renderer/index.html');
    win.webContents.openDevTools()

    const captureFolder = './renderer/media/snippets';

    win.webContents.on('did-finish-load', function () {
        win.webContents.send('get:files', fs.readdirSync(captureFolder));
    });

    ipcMain.on('open:capture', (e, isScreenshot) => {
        if (isScreenshot) {
            win.hide();
            desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: externalDisplay.width, height: externalDisplay.height } }).then(sources => {
                let img = sources[0].thumbnail.toPNG();
                const filepath = mediaPath + "/screenshot-" + moment().format('MM-DD-YY-hhmmss') + ".png"
                if (!fs.existsSync(mediaPath)) {
                    fs.mkdirSync(mediaPath);
                }
                fs.writeFile(filepath, img, (err) => {
                    if (err) console.log(err);
                    shell.showItemInFolder(filepath);
                });
                // regionWindow.webContents.send('screen:capped', image);
            }).finally(win.show())
        }
        else {
            win.minimize()
            regionWindow = new BrowserWindow({
                width: 500,
                height: 500,
                frame: false,
                transparent: true,
                fullscreen: true,
                resizable: false,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                },
            });

            regionWindow.loadFile('renderer/regionCapture.html');
            regionWindow.webContents.openDevTools()

        }


    })
    ipcMain.on('screen:capture', (e, data) => {

        desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: externalDisplay.width, height: externalDisplay.height } }).then(sources => {
            let img = sources[0].thumbnail.toDataURL();
            let encondedImageBuffer = Buffer.from(img.split(',')[1], 'base64');
            jimp.read(encondedImageBuffer)
                .then(image => {

                    checkPointX = data.point1.x;
                    checkPointY = data.point1.y;

                    if (data.point2.x < data.point1.x) {
                        checkPointX = data.point2.x;
                    }
                    if (data.point2.y < data.point1.y) {
                        checkPointY = data.point2.y;
                    }
                    let crop = image.crop(checkPointX, checkPointY,
                        data.width, data.height)


                    crop.getBuffer(crop.getMIME(), function (err, buffer) {
                        if (err) throw err;
                        const filepath = mediaPath + "/Region Capture-" + moment().format('MM-DD-YY-hhmmss') + ".png"
                        if (!fs.existsSync(mediaPath)) {
                            fs.mkdirSync(mediaPath);
                        }
                        fs.writeFile(filepath, buffer, (err) => {
                            if (err) console.log(err);
                            shell.showItemInFolder(filepath);
                        });
                    })

                })
                .catch(err => {
                    console.error(err);
                }).finally(
                    regionWindow.close()
                );

            // regionWindow.webContents.send('screen:capped', image);
        }).finally(() => {
            win.restore()
        })
    })

    ipcMain.on('open:scribe', () => {
        //!When Main.py is build
        // child(executablePath, function (err, data) {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
        // });
    })


    ipcMain.on('open:drawing', (e, currentImage) => {

        win.minimize()
        drawingWindow = new BrowserWindow({
            // width: 500,
            // height: 500,
            // frame: false,
            // transparent: true,
            // fullscreen: true,
            maximized: true,
            // resizable: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        });

        drawingWindow.loadFile('renderer/drawing.html');
        drawingWindow.maximize();
        drawingWindow.webContents.openDevTools()
        drawingWindow.webContents.on('did-finish-load', function () {
            drawingWindow.webContents.send('get:selectedfile', currentImage);
        });
    })


    ipcMain.on("close:App", () => {
        win.close()
    })
};
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


