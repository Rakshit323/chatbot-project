from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
from chatbot_manager import ChatbotManager

# Application Configuration

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

bot = ChatbotManager()

# Routes

@app.route("/")
def home():  #function for home page

    bot.reset_chat()

    return render_template("index.html")

@app.route("/reset", methods=["POST"])
def reset():  #function for refresh

    bot.reset_chat()

    return jsonify({
        "status": "success"
    })

@app.route("/upload", methods=["POST"])
def upload(): #function for hnadling uploaded files

    if "file" not in request.files:

        return jsonify({
            "success": False,
            "message": "No file received."
        }), 400

    file = request.files["file"]

    if file.filename == "":

        return jsonify({
            "success": False,
            "message": "No file selected."
        }), 400

    filename = secure_filename(file.filename)

    name, extension = os.path.splitext(filename)

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    counter = 1

    while os.path.exists(filepath):

       filename = f"{name}_{counter}{extension}"

       filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

       counter += 1

    file.save(filepath)

    bot.add_attachment(filename, filepath)

    return jsonify({

        "success": True,

        "filename": filename,

        "filepath": filepath

    })

@app.route("/chat", methods=["POST"])  #chatbot api
def chat():  #main chatbot function

    data = request.get_json()

    message = data.get("message", "")

    if message.lower() == "start":

        reply = bot.start_chat()

    else:

        reply = bot.process_message(message)

    return jsonify({
        "reply": reply
    })


# Application Entry Point

if __name__ == "__main__":

    app.run(debug=True)