from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()

def init_db(app):
    """Initialize database with the Flask app"""
    # Configure database from environment variable or default to SQLite
    database_url = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), "healthcare.db")}')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    return db
