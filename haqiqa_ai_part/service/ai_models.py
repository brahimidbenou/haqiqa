import chromadb
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_cerebras import ChatCerebras
from . import config

model_name = "sentence-transformers/all-MiniLM-L6-v2"
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': False}

embed_model = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)

db_client = chromadb.PersistentClient(path="./chroma_db")

llm = ChatCerebras(
    model="llama-3.3-70b",
    api_key= config.CEREVRAS_API_KEY,
    temperature=0.1,
    max_tokens=1024
)