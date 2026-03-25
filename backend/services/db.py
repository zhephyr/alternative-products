from tinydb import TinyDB, Query

class SessionDB:
    """
    Local storage service managing active and historical visual product searches.
    Uses TinyDB underneath for simple, serverless JSON storage.
    """
    def __init__(self, db_path: str = "sessions.json"):
        self.db = TinyDB(db_path)
        self.Session = Query()

    def create_session(self, session_id: str):
        """Initializes an empty session in the database."""
        self.db.insert({
            "id": session_id,
            "status": "processing",
            "results": []
        })

    def get_session(self, session_id: str):
        """Retrieves a session object by ID."""
        return self.db.get(self.Session.id == session_id)

    def add_result(self, session_id: str, result: dict):
        """Appends a single product result to the session."""
        session = self.get_session(session_id)
        if session:
            session["results"].append(result)
            self.db.update({"results": session["results"]}, self.Session.id == session_id)
            
    def update_status(self, session_id: str, status: str):
        """Updates the top-level status of the session (e.g., 'processing' -> 'completed')."""
        self.db.update({"status": status}, self.Session.id == session_id)
