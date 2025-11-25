from langchain_core.prompts import PromptTemplate, ChatPromptTemplate


summary_template_str = """
You are an expert in text distillation. Your task is to summarize the following video transcript.
Generate a single, dense paragraph that captures the core topics, key points, and main conclusions.
Omit all introductions, filler phrases, and repetitive sentences. Focus only on the essential information. The output must be one coherent paragraph.

Transcript:
{text}

Summary:"""
summary_prompt = PromptTemplate.from_template(summary_template_str)


title_template_str = """
You are an expert YouTube Content Strategist and SEO specialist.
Your task is to create a single, high-impact title for the video based on the transcript.
The title must be:
1.  Short and punchy (under 60 characters).
2.  Click-worthy and spark curiosity.
3.  Contain the main keywords from the transcript to be easily discoverable.
4.  Formatted in Title Case.
5.  Do NOT use clickbait or misleading phrases.

Transcript:
{text}

Title:"""
title_prompt = PromptTemplate.from_template(title_template_str)


chat_bot_template = """
You are a precise and factual AI analyst.
Your *sole task* is to answer the user's question by *strictly* using the provided video context.

-   Read the context and the question carefully.
-   If the answer is in the context, provide a concise and direct answer based *only* on that text.
-   If the context does *not* contain the answer, you *must* state: "I'm sorry, that information is not in the video."
-   Do not, under any circumstances, use external knowledge or make assumptions.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""
chat_bot_prompt = ChatPromptTemplate.from_template(chat_bot_template)


"""
You are a precise and factual AI analyst.
Your *sole task* is to answer the user's question by *strictly* using the provided video context.

-   Read the context and the question carefully.
-   If the answer is in the context, provide a concise and direct answer based *only* on that text.
-   If the context does *not* contain the answer, you *must* state: "I'm sorry, that information is not in the video."
-   Do not, under any circumstances, use external knowledge or make assumptions.

CONTEXT:
The simplest and oldest bombs store energy in the form of a low explosive. Black powder is an example of a low explosive. Low explosives typically consist of a mixture of an oxidizing salt, such as potassium nitrate (saltpeter), with solid fuel, such as charcoal or aluminium powder. These compositions deflagrate upon ignition, producing hot gas. Under normal circumstances, this deflagration occurs too slowly to produce a significant pressure wave; low explosives, therefore, must generally be used in large quantities or confined in a container with a high burst pressure to be useful as a bomb.

QUESTION:
Is brahim gay ?
ANSWER:
"""