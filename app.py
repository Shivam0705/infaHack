from flask import Flask, render_template, request, jsonify
from chat import get_response
import subprocess

app = Flask(__name__)

@app.get("/")  # rendering chatbot at home page
def index_get():
    return render_template("base.html")

@app.post("/predict")  # predicting response from input
def predict():
    text = request.get_json().get("message")
    responses = get_response(text)

    if "perform_create_record" in responses:
        message = {"answers": ["Record creation automation is being performed. Please enjoy the live demo..."]}
        # Trigger web automation endpoint
        subprocess.run(
            ['java', '-cp', 'C:/Users/shravi/Desktop/ex/SeleniumChatbot/src;.C:/Users/shravi/Desktop/ex/SeleniumChatbot/selenium-server-4.21.0.jar', 'recordCreation'],
            capture_output=True, text=True
        )
    else:
        message = {"answers": responses}

    return jsonify(message)

@app.post("/create_record")  # new endpoint for web automation
def create_record():
    try:
        selenium_jar = r'C:\\Users\\shravi\\Desktop\\ex\\SeleniumChatbot\\selenium-server-4.21.0.jar'
        java_class_dir = r'C:\\Users\\shravi\\Desktop\\ex\\SeleniumChatbot\\src'

        result = subprocess.run(
            ['java', '-cp', f'.;{selenium_jar};{java_class_dir}/*', 'recordCreation'],
            capture_output=True,
            text=True,
            cwd=java_class_dir
        )

        output = result.stdout
        return jsonify({"output": output})
    except Exception as e:
        return jsonify({"output": f"An error occurred: {e}"})

if __name__ == "__main__":
    app.run(debug=True)
