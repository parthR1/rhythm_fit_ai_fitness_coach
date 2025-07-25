from flask import Blueprint, redirect, url_for, session, render_template
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
load_dotenv()
import os
import secrets

auth_bp = Blueprint("auth", __name__)
oauth = OAuth()


def config_oauth(app):
    oauth.init_app(app)
    oauth.register(
        name='google',
        client_id=os.environ.get('GOOGLE_CLIENT_ID'),
        client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'},
    )


@auth_bp.route("/login")
def login():
    nonce = secrets.token_urlsafe(16)
    session['nonce'] = nonce
    redirect_uri = url_for("auth.auth_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri, nonce=nonce)

@auth_bp.route("/signup")
def signup():
    return render_template("signup.html")


@auth_bp.route("/auth/callback")
def auth_callback():
    token = oauth.google.authorize_access_token()
    nonce = session.pop('nonce', None)
    user = oauth.google.parse_id_token(token, nonce=nonce)
    session['user'] = user
    return redirect(url_for('select'))
