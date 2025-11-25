import mysql.connector
import uuid 
from uuid import UUID 
from . import config, ai_models, entities
from langchain_core.documents import Document
from langchain_chroma import Chroma

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

def update_video_status(video_id, status):
    conn = get_db_connection()
    if not conn:
        return
        
    try:
        with conn.cursor() as cursor:
            sql = "UPDATE videos SET status = %s WHERE id = %s"
            video_id_bytes = UUID(video_id).bytes 
            
            cursor.execute(sql, (status, video_id_bytes))
        conn.commit()
        print(f"Updated video {video_id} status to {status}")
    except mysql.connector.Error as err:
        print(f"Error updating status: {err}")
    except ValueError:
        print(f"Error: Invalid video_id format: {video_id}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn.is_connected():
            conn.close()

def update_video_title(video_id, title):
    conn = get_db_connection()
    if not conn: 
        return

    try:
        with conn.cursor() as cursor:
            sql = "UPDATE videos SET title = %s WHERE id = %s"    
            video_id_bytes = UUID(video_id).bytes 

            cursor.execute(sql, (title, video_id_bytes))
        conn.commit()
    except mysql.connector.Error as err:
        print(f"Error updating: {err}")
    except ValueError:
        print(f"Error: Invalid video_id format: {video_id}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn.is_connected():
            conn.close()

def update_video_summary(video_id, summary):
    conn = get_db_connection()
    if not conn: 
        return

    try:
        with conn.cursor() as cursor:
            sql = "UPDATE videos SET summary = %s WHERE id = %s"    
            video_id_bytes = UUID(video_id).bytes 

            cursor.execute(sql, (summary, video_id_bytes))
        conn.commit()
    except mysql.connector.Error as err:
        print(f"Error updating: {err}")
    except ValueError:
        print(f"Error: Invalid video_id format: {video_id}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn.is_connected():
            conn.close()

def save_transcript_chunks(video_id, segments):
    conn = get_db_connection()
    if not conn:
        return

    try:
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO video_transcripts 
                (id, video_id, start_time, end_time, transcript_text) 
            VALUES (%s, %s, %s, %s, %s)
            """
            
            video_id_bytes = UUID(video_id).bytes
            
            data_to_insert = [
                (
                    uuid.uuid4().bytes, 
                    video_id_bytes,
                    seg['start'], 
                    seg['end'], 
                    seg['text']
                )
                for seg in segments
            ]

            cursor.executemany(sql, data_to_insert)
        conn.commit()
        print(f"Saved {len(segments)} transcript chunks for video {video_id}")
    except mysql.connector.Error as err:
        print(f"Error saving transcripts: {err}")
    except ValueError:
        print(f"Error: Invalid video_id format: {video_id}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn.is_connected():
            conn.close()

def get_transcripts_chuncks(video_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    results = []
    try:
        with conn.cursor() as cursor:
           sql = "SELECT * FROM video_transcripts WHERE video_id=%s"
           video_id_bytes = UUID(video_id).bytes

           cursor.execute(sql, (video_id_bytes,))
           results = cursor.fetchall()
        
    except mysql.connector.Error as err:
        print(f"Error getting transcripts: {err}")
    except ValueError:
        print(f"Error: Invalid video_id format: {video_id}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn.is_connected():
            conn.close()
    
    chunk_objects = [entities.TranscriptChunk.from_tuple(row) for row in results]
    return chunk_objects

def embed_script(video_id):
    chunks = get_transcripts_chuncks(video_id)
    if not chunks:
        print(f"No chunks found for video {video_id}.")
        return

    docs_to_add = []
    chunk_ids = [] 

    print(f"Preparing {len(chunks)} documents for embedding...")

    for chunk in chunks:
        try:
            chunk_id_str = str(uuid.UUID(bytes=chunk.id))
            video_id_str = str(uuid.UUID(bytes=chunk.video_id))

            doc = Document(
                page_content=chunk.transcript_text,
                metadata={
                    "id": chunk_id_str,  
                    "video_id": video_id_str, 
                    "start_time": chunk.start_time,
                    "end_time": chunk.end_time
                }
            )
            docs_to_add.append(doc)
            chunk_ids.append(chunk_id_str)

        except Exception as e:
            print(f"Error processing chunk: {e}")
            print(f"Problem chunk.id: {chunk.id} (type: {type(chunk.id)})")
            print(f"Problem chunk.video_id: {chunk.video_id} (type: {type(chunk.video_id)})")
            continue 

    if not docs_to_add:
        print("No valid documents to add after processing.")
        return

    collection_name = f"video_{video_id}"
    vector_store = Chroma(
        client=ai_models.db_client,
        collection_name=collection_name,
        embedding_function=ai_models.embed_model
    )

    vector_store.add_documents(docs_to_add, ids=chunk_ids)