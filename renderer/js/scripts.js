const ipc = ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('main');
    const scrollBar = document.querySelector('.scrollbar');
    const btnPage = document.querySelectorAll(".btnPage");
    const page = document.querySelectorAll(".page");

    main.addEventListener("scroll", function () {

        //Scroll bar
        let x = Math.abs(main.scrollTop - (main.scrollHeight - window.innerHeight));
        let y = (main.scrollHeight - window.innerHeight);
        scrollBar.style.transform = "translateY(" + -((x / y) * 100) + "vh)";
        //Scroll bar End
        console.log(scrollBar)
    }, false);
    btnPage.forEach(element => {
        element.addEventListener("click", function (e) {
            pageName = e.currentTarget.getAttribute("data-page")
            page.forEach(currentPage => {
                if (currentPage.getAttribute("id") == pageName) {
                    currentPage.style.display = "grid";
                } else {
                    currentPage.style.display = "none";
                }
            });

            btnPage.forEach(currentBtnPage => {
                if (currentBtnPage.getAttribute("data-page") == pageName) {
                    currentBtnPage.classList.add("active");
                } else {
                    currentBtnPage.classList.remove("active");
                }
            });
        }, false);
    });


    document.getElementById('capture').addEventListener('click', () => {
        console.log("loaded");
        ipc.send('open:capture', false)
    })

    document.getElementById('screenshot').addEventListener('click', () => {
        console.log("loaded");
        ipc.send('open:capture', true)
    })

    document.getElementById('scribe').addEventListener('click', () => {
        console.log("loaded");
        ipc.send('open:scribe', true)
    })

    let imageDiv;
    ipc.on('get:files', (data) => {
        console.log(data)
        data.forEach(element => {
            fileDom = `
            <div class="itemContainer">
                <div class="imgContainer">
                <div class="imgLabel">${element}</div>
                    <div class="imageWrapper" data-source = "./media/snippets/${element}">
                        <img src="./media/snippets/${element}" alt="">
                    </div>
                </div>
            </div>
            `
            document.getElementById('screenshots').insertAdjacentHTML("beforeend", fileDom);
        });
        imageDiv = document.querySelectorAll("div.imageWrapper")

        imageDiv.forEach(element => {
            element.addEventListener("click", function (e) {
                console.log(e.currentTarget.getAttribute("data-source"))
                ipc.send('open:drawing', e.currentTarget.getAttribute("data-source"))
            }, false);
        });
    })
    document.getElementById("closeBtn").addEventListener('click', () => {
        ipc.send('close:App')
    })
})
