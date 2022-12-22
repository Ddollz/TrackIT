# from tkinter import *
import tkinter
# import customtkinter
import pynput
import pyautogui
import json
import os
import random
from PIL import Image, ImageDraw
from datetime import date


class App(tkinter.Tk):
    def __init__(self):
        super().__init__()
        self.title("")
        self.w = "200"
        self.h = "200"

        self.screenshotID = 0
        self.started = False
        self.totalDocs = 1
        self.currentDoc = ""
        self.parentDir = "./renderer/media/Documents"
        self.dateToday = date.today()

        self.currentStep = []
        self.currentStepCoordinates = {}
        self.readingkey = False
        self.keyString = ''

        # Opening JSON file
        f = open("./documents.json")
        self.dictionary = json.load(f)
        f.close()

        self.ws = self.winfo_screenwidth()
        self.hs = self.winfo_screenheight()
        x = str(int((self.ws/2) - int(self.w)/2))
        y = str(int((self.hs/2) - int(self.h)/2))

        self.geometry(self.w+"x"+self.h+"+"+x+"+"+y)
        self.recordBtn = tkinter.Button(
            master=self, command=self.startRecording, text="Record",
            background="#ff4742", fg='#fff', height=2, width=10)
        self.recordBtn.pack(padx=20, pady=70)

        self.KeyListener = None
        self.MouseListener = None

    def startRecording(self):
        if self.started == False:

            self.KeyListener = pynput.keyboard.Listener(on_press=self.on_press)
            self.MouseListener = pynput.mouse.Listener(on_click=self.on_click)

            self.MouseListener.start()
            self.KeyListener.start()
            self.started = True
            self.recordBtn.configure(text="Stop")
            self.iconify()

        else:
            docname = self.currentDoc
            self.MouseListener.stop()
            self.KeyListener.stop()
            self.started = False
            self.recordBtn.configure(text="Record")
            self.currentDoc = ""
            self.totalDocs = 1
            self.screenshotID = 0

            randomNumber = random.randint(1, 3000)
            documentTemp = {'documentid': randomNumber, 'documentName': 'Document {}'.format(
                randomNumber), 'documentDate': str(self.dateToday), 'documentStep': self.currentStep[: -1], 'stepMouseCoordinates': self.currentStepCoordinates,
                'documentPath': docname
            }
            self.dictionary['Documents'].append(documentTemp)
            json_object = json.dumps(self.dictionary, indent=4)
            with open("./documents.json", "w") as outfile:
                outfile.write(json_object)
            # print(self.dictionary['Documents'])

    def on_click(self, x, y, button, pressed):
        if pressed:
            if self.readingkey:

                self.currentStep.append(self.keyString)
                self.readingkey = False
                self.keyString = ''
            # print('Mouse clicked at ({0}, {1}) with {2}'.format(x, y, button))
            if (self.currentDoc == ""):
                for base, dirs, files in os.walk(self.parentDir):
                    # print('Searching in : ', base)
                    for directories in dirs:
                        self.totalDocs += 1

                self.currentDoc = "Doc-" + str(self.totalDocs)
                path = os.path.join(self.parentDir, self.currentDoc)
                os.mkdir(path)

            # !uncomment to allow screenshots
            self.screenshotID += 1
            mousex, mousey = pyautogui.position()
            screenshot = pyautogui.screenshot()
            draw = ImageDraw.Draw(screenshot)
            X, Y = mousex, mousey
            r = 10
            draw.ellipse(
                [(X-r, Y-r), (X+r, Y+r)], fill='#f2ff0033', outline='blue')
            screenshot.save(self.parentDir+"/"+self.currentDoc+"/" +
                            "screenshot-"+str(self.screenshotID)+".png")

            self.currentStep.append(
                "screenshot-"+str(self.screenshotID)+".png")
            self.currentStepCoordinates.update({"screenshot-"+str(self.screenshotID) +
                                                ".png": [mousex, mousey]})

    def on_press(self, key):

        if key == pynput.keyboard.Key.backspace:
            if self.keyString != '':
                self.keyString = self.keyString[:-1]
            # print(self.keyString)

        if key == pynput.keyboard.Key.space:
            self.keyString = self.keyString+' '

            # print(self.keyString)
        if 'char' in dir(key):
            if not self.readingkey:
                self.keyString = key.char
                self.readingkey = True
            else:
                self.keyString = self.keyString+key.char

        # print(self.keyString)


if __name__ == "__main__":
    app = App()
    app.mainloop()
