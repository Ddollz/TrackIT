
const ipc = ipcRenderer
let currentImageUrl;

const canvas = new fabric.Canvas('canvas');
const canvasWrapper = document.getElementById('canvasWrapper');
let imgSizeWidth;
let imgSizeHeight;
let cameraZoom = .5
let MAX_ZOOM = 3
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0005
const modes = {
    drawing: 'drawing'
}
let currentMode;
let currentColor = "#000";

ipc.on('get:selectedfile', (data) => {
    currentImageUrl = data
    fabric.Image.fromURL(currentImageUrl, function (oImg) {

        imgSizeWidth = oImg.width
        imgSizeHeight = oImg.height
        canvas.setWidth(imgSizeWidth)
        canvas.setHeight(imgSizeHeight)
        console.log(imgSizeWidth)
        if (imgSizeWidth > 1000) {
            canvasWrapper.style.transform = `scale(${cameraZoom})`;
        }
        oImg.scaleToWidth(canvas.width);
        canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / oImg.width,
            scaleY: canvas.height / oImg.height
        });

    });

})

function adjustZoom(zoomAmount) {
    // console.log(cameraZoom)
    if (zoomAmount) {
        cameraZoom += zoomAmount
    }

    cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
    cameraZoom = Math.max(cameraZoom, MIN_ZOOM)

    if (!checkOverflow(document.body)) {
        if (cameraZoom >= .5) {
            canvasWrapper.style.transform = `scale(${cameraZoom})`;
            // console.log(checkOverflow(document.body))
        } else {
            cameraZoom = .5
        }
    }
    if (checkOverflow(document.body)) {
        cameraZoom -= zoomAmount
        canvasWrapper.style.transform = `scale(${cameraZoom})`;

    }
    // console.log(cameraZoom)
}
function checkOverflow(el) {
    var curOverflow = el.style.overflow;

    if (!curOverflow || curOverflow === "visible")
        el.style.overflow = "hidden";

    var isOverflowing = el.clientWidth < el.scrollWidth
        || el.clientHeight < el.scrollHeight;

    el.style.overflow = curOverflow;

    return isOverflowing;
}
canvasWrapper.addEventListener('wheel', (e) => adjustZoom(-e.deltaY * SCROLL_SENSITIVITY))

const toggleMode = (mode) => {
    if (mode === modes.drawing) {
        if (currentMode === modes.drawing) {
            currentMode = ""

            canvas.isDrawingMode = false;
        } else {
            currentMode = modes.drawing;
            canvas.freeDrawingBrush.width = 8
            canvas.isDrawingMode = true;
        }
    }
}

// ? Color Picker
const alwan = new Alwan('#colorPicker', {
    id: '',
    classname: '',
    theme: 'dark',
    toggle: true,
    popover: true,
    position: 'bottom-start',
    margin: 8,
    preset: true,
    color: '#000',
    default: '#000',
    target: '',
    disabled: false,
    format: 'rgb',
    singleInput: false,
    inputs: {
        rgb: true,
        hex: true,
        hsl: true,
    },
    opacity: true,
    preview: true,
    copy: true,
    swatches: [],
});
alwan.on('change', function (color) {
    currentColor = `hsla(${color.hsl(true)[0]},${color.hsl(true)[1]}%,${color.hsl(true)[2]}%,${color.hsl(true)[3]})`
    canvas.freeDrawingBrush.color = currentColor;
})
document.getElementById('widthInput').addEventListener("input", (e) => {
    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = parseInt(e.target.value) || 1
        canvas.renderAll()
    }
});
// ? Color Picker
