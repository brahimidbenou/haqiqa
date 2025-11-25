from . import ai_models, prompts
from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

def get_vector_store(video_id):
    collection_name = f"video_{video_id}"
    
    vector_store = Chroma(
        client = ai_models.db_client,
        collection_name = collection_name,
        embedding_function = ai_models.embed_model
    )
    return vector_store

def get_retriever(vector_store, search="similarity", k=140): 
    retriever = vector_store.as_retriever(search_type=search, search_kwargs={"k": k})
    return retriever

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_rag(retriever):
    answer_generator_chain = (
        prompts.chat_bot_prompt
        | ai_models.llm
        | StrOutputParser()
    )
    
    rag_chain = RunnableParallel(
        answer = (
            {"context": (lambda x: x["input"]) | retriever | format_docs, "question": (lambda x: x["input"])}
            | answer_generator_chain
        ),
        context = (
            (lambda x: x["input"]) | retriever
        )
    )
    
    return rag_chain

def format_rag_response(rag_response):

    answer = rag_response.get("answer", "No answer found.")
    source_docs = rag_response.get("context", []) 
    
    references = []
    if source_docs:
        for doc in source_docs:
            metadata = doc.metadata
            references.append({
                "text_chunk": doc.page_content,
                "start_time": metadata.get("start_time"),
                "end_time": metadata.get("end_time"),
            })
            
    return {
        "answer": answer,
        "references": references
    }

def get_rag_response(video_id, query, stream = False):
    print(f"Starting RAG query for video_id: {video_id}")
    try:
        vector_store = get_vector_store(video_id)
        retriever = get_retriever(vector_store)
        rag_chain = get_rag(retriever)

        if not stream:
            resp = rag_chain.invoke({"input": query})
            format_resp = format_rag_response(resp)
            return format_resp

        def stream_generator():
            buffer = ""
            for chunk in rag_chain.stream({"input": query}):
                if isinstance(chunk, dict) and "answer" in chunk:
                    token = chunk["answer"]
                else:
                    continue
                
                buffer += token
                yield f"data: {token}\n\n"
            
            yield f"data: [DONE]\n\n"

        return stream_generator()

    except Exception as e:
        print(f"Error during RAG pipeline: {e}")
        if "does not exist" in str(e):
            return {"error": "Video collection not found"}
        return {"error": str(e)}

def get_full_transcript(video_id: str):
    try:
        vector_store = get_vector_store(video_id)
        results = vector_store.get(include=["metadatas", "documents"])
        
        if not results or not results.get("documents"):
            print(f"No documents found in collection for video_id: {video_id}")
            return None

        docs_with_meta = list(zip(results["documents"], results["metadatas"]))
        
        sorted_docs = sorted(docs_with_meta, key=lambda item: item[1].get('start_time', 0))
        
        full_transcript = "\n".join([doc[0] for doc in sorted_docs])
        return full_transcript
    except Exception as e:
        print(f"Error fetching full transcript for video_id {video_id}: {e}")
        return None

def get_summary(video_id):
    try:
        full_transcript = get_full_transcript(video_id)
        
        if full_transcript is None:
            return {"error": "Video collection not found or is empty."}

        summarize_chain = prompts.summary_prompt | ai_models.llm | StrOutputParser()
        summary = summarize_chain.invoke({"text": full_transcript})
        
        return {"answer": summary}

    except Exception as e:
        print(f"Error during summarization: {e}")
        return {"error": str(e)}

def get_title(video_id):
    try:
        full_transcript = get_full_transcript(video_id)
        
        if full_transcript is None:
            return {"error": "Video collection not found or is empty."}
        titlize_chain = prompts.title_prompt | ai_models.llm | StrOutputParser()
        title = titlize_chain.invoke({"text": full_transcript})
        
        return {"answer": title}

    except Exception as e:
        print(f"Error during summarization: {e}")
        return {"error": str(e)}