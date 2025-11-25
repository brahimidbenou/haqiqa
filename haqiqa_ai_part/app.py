from dotenv import load_dotenv
import os

load_dotenv()

from service import create_app

app = create_app()

if __name__ == "__main__":
    if not os.environ.get("INTERNAL_API_KEY"):
        print("FATAL ERROR: INTERNAL_API_KEY is not set.")
        print("Please check your .env file.")
        exit(1)
        
    print(f"Starting server... Listening on http://0.0.0.0:5000")
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)