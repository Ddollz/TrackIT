
const ipc = ipcRenderer
ipc.on('screen:capped', (e) => {
    console.log(e)
    document.getElementById('places').src = e;

})
const box = document.getElementById('box');
var point1;     // Get the horizontal coordinate
var point2;     // Get the horizontal coordinate
var x = 0;     // Get the horizontal coordinate
var y = 0;     // Get the vertical coordinate

var mx = 0;     // Get the horizontal coordinate
var my = 0;     // Get the vertical coordinate
var coor = 0;
var isDown = false;
// document.body.addEventListener('drag', function (event) {
//     console.log('clicked inside');
// });

document.body.addEventListener("mousedown", (event) => {
    console.log("test")
    if (!isDown) {
        x = event.clientX;     // Get the horizontal coordinate
        y = event.clientY;     // Get the vertical coordinate
        box.style.display = 'block';
        box.style.position = 'absolute';
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.border = '4px solid white';

        point1 = { x: x, y: y }
        console.log("X coords: " + x + ", Y coords: " + y)
        isDown = true
    }
});

document.body.addEventListener("mousemove", (event) => {
    if (isDown) {
        mx = event.clientX;     // Get the horizontal coordinate
        my = event.clientY;     // Get the vertical coordinate
        cy = Math.abs(my - y);
        cx = Math.abs(mx - x);
        if (mx < x) {
            box.style.left = mx + 'px';
        }
        if (my < y) {
            box.style.top = my + 'px';
        }
        box.style.width = cx + 'px';
        box.style.height = cy + 'px';
    }

});
document.body.addEventListener("mouseup", (event) => {
    if (isDown) {
        console.log("X coords: " + x + ", Y coords: " + y)
        point2 = { x: mx, y: my }
        data = { point1: point1, point2: point2, width: cx, height: cy }
        ipc.send('screen:capture', data)
        isDown = false

        box.style.display = 'hidden';
        box.style.position = 'absolute';
        box.style.left = '0px';
        box.style.top = '0px';
        box.style.width = '0px';
        box.style.height = '0px';
        box.style.border = 'unset';

    }
});
