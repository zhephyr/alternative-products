from tinydb import TinyDB, Query

class SessionDB:
    """
    Local storage service managing active and historical visual product searches.
    Uses TinyDB underneath for simple, serverless JSON storage.
    """
    def __init__(self, db_path: str = "sessions.json"):
        self.db = TinyDB(db_path)
        self.sessions = self.db.table("sessions")
        self.users = self.db.table("users")
        self.history = self.db.table("history")
        self.favorites = self.db.table("favorites")

    def create_session(self, session_id: str, user_id: str = None, image_url: str = "uploaded_image.jpg"):
        """Initializes an empty session in the database."""
        self.sessions.insert({
            "id": session_id,
            "user_id": user_id,
            "image_url": image_url,
            "status": "processing",
            "results": []
        })

    def get_session(self, session_id: str):
        """Retrieves a session object by ID."""
        Session = Query()
        result = self.sessions.search(Session.id == session_id)
        return result[0] if result else None
        
    def get_user_by_username(self, username: str):
        User = Query()
        result = self.users.search(User.username == username)
        return result[0] if result else None
        
    def create_user(self, user_data: dict):
        self.users.insert(user_data)

    def add_result(self, session_id: str, result: dict):
        """Appends a single product result to the session."""
        session = self.get_session(session_id)
        if session:
            session["results"].append(result)
            SessionQuery = Query()
            self.sessions.update({"results": session["results"]}, SessionQuery.id == session_id)
            
    def update_status(self, session_id: str, status: str):
        """Updates the top-level status of the session (e.g., 'processing' -> 'completed')."""
        Session = Query()
        self.sessions.update({"status": status}, Session.id == session_id)

    # ----------------
    # Favorites Methods
    # ----------------
    def add_favorite(self, user_id: str, product_id: str, product_details: dict):
        Favorite = Query()
        # Prevent duplicates
        if self.favorites.contains((Favorite.user_id == user_id) & (Favorite.product_id == product_id)):
            return False
        
        self.favorites.insert({
            "user_id": user_id,
            "product_id": product_id,
            "product_details": product_details
        })
        return True

    def remove_favorite(self, user_id: str, product_id: str):
        Favorite = Query()
        removed = self.favorites.remove((Favorite.user_id == user_id) & (Favorite.product_id == product_id))
        return len(removed) > 0

    def get_user_favorites(self, user_id: str):
        Favorite = Query()
        return self.favorites.search(Favorite.user_id == user_id)

    # ----------------
    # History Methods
    # ----------------
    def add_history(self, user_id: str, image_url: str, results: list):
        self.history.insert({
            "user_id": user_id,
            "image_url": image_url,
            "results": results
        })

    def get_user_history(self, user_id: str):
        History = Query()
        # Return reverse chronological (newest first based on insertion order)
        docs = self.history.search(History.user_id == user_id)
        return list(reversed(docs))
