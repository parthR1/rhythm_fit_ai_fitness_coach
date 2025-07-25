from flask import Flask, render_template
from routes.auth import auth_bp, config_oauth


app = Flask(__name__)
app.secret_key = 'your-secret-key'

config_oauth(app)
# Register Blueprints
app.register_blueprint(auth_bp)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/select")
def select():
    return render_template("select.html")


@app.route("/pose")
def pose():
    return render_template("pose.html")



if __name__ == "__main__":
    app.run(debug=True)
