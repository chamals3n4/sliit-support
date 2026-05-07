import ballerina/log;
import ballerinax/openai.chat;
import ballerinax/openai.embeddings;
import ballerinax/pinecone.vector;

configurable string OPENAI_TOKEN = ?;
configurable string PINECONE_API_KEY = ?;
configurable string PINECONE_URL = ?;
configurable string bucketName = ?;

final embeddings:Client embeddingsClient = check new ({
    auth: {
        token: OPENAI_TOKEN
    },
    timeout: 60
});

final vector:Client pineconeVectorClient = check new ({
    apiKey: PINECONE_API_KEY
}, serviceUrl = PINECONE_URL);

final chat:Client openAIChat = check new ({
    auth: {
        token: OPENAI_TOKEN
    },
    timeout: 60
});

public type Metadata record {
    string text;
};

public type ChatResponseChoice record {|
    chat:ChatCompletionResponseMessage message?;
    int index?;
    string finish_reason?;
    anydata...;
|};

isolated function llmChat(string query) returns string|error {
    if query.trim().length() == 0 {
        return error("Query cannot be empty");
    }
    log:printInfo("Received query", query = query);
    float[] embeddingsFloat = check getEmbeddings(query);
    log:printInfo("Embeddings generated");

    // queryRequest.vector = embeddingsFloat;
    vector:QueryRequest queryRequest = {
        topK: 4,
        includeMetadata: true,
        vector: embeddingsFloat
    };
    vector:QueryMatch[] matches = check retrieveData(queryRequest);
    log:printInfo("Pinecone matches retrieved", count = matches.length());

    string context = check augment(matches);
    log:printInfo("Context augmented");

    string chatResponse = check generateText(query, context);
    log:printInfo("Response generated successfully");
    return chatResponse;
}

isolated function getEmbeddings(string query) returns float[]|error {
    embeddings:CreateEmbeddingRequest req = {
        model: "text-embedding-ada-002",
        input: query
    };
    embeddings:CreateEmbeddingResponse embeddingsResult = check embeddingsClient->/embeddings.post(req);

    float[] embeddings = embeddingsResult.data[0].embedding;
    return embeddings;
}

isolated function retrieveData(vector:QueryRequest queryRequest) returns vector:QueryMatch[]|error {
    vector:QueryResponse response = check pineconeVectorClient->/query.post(queryRequest);
    vector:QueryMatch[]? matches = response.matches;
    if (matches == null) {
        return error("No matches found");
    }
    return matches;
}

isolated function augment(vector:QueryMatch[] matches) returns string|error {
    string context = "";
    foreach vector:QueryMatch data in matches {
        Metadata metadata = check data.metadata.cloneWithType();
        context = context.concat(metadata.text);
    }
    return context;
}

isolated function generateText(string query, string context) returns string|error {
    string systemPrompt = string `You are a knowledgeable and friendly support assistant for SLIIT (Sri Lanka Institute of Information Technology), 
    a leading private university in Sri Lanka. You help students, prospective students, staff, and visitors get accurate, 
    useful answers about anything related to SLIIT.

    ---

    ## Your Knowledge Sources (in order of priority)

    1. **Provided context** — Always your primary source. If the context answers the question, use it.
    2. **General knowledge about SLIIT** — You have broad knowledge about SLIIT: its faculties, degree programs, 
    campus locations (Malabe, Colombo, Kandy, Kurunegala, Matara), the academic calendar structure, common 
    university processes, and SLIIT-specific terminology. Use this confidently when context is silent.
    3. **General knowledge about Sri Lankan higher education** — UGC regulations, NVQ frameworks, industrial 
    training norms, how private universities operate in Sri Lanka, etc.
    4. **General world knowledge** — For universal concepts like what an acronym means, how a process typically 
    works at any university, technology terms, etc.

    Never fabricate specific details like names, phone numbers, deadlines, or fees unless they appear in the context.

    ---

    ## Handling Gaps in Context

    When the context doesn't have the answer, think before defaulting to "I don't know":

    - **Abbreviations & terminology** — If someone asks "what is ITD?", use your knowledge: it's SLIIT's 
    Industrial Training Division, which coordinates placement opportunities for undergraduate students. 
    Answer it. Don't redirect unnecessarily.
    - **Common university processes** — If someone asks how grade appeals work and context is silent, 
    explain the general process and note they should confirm specifics with the relevant faculty or registry.
    - **General SLIIT facts** — Programs offered, campus locations, intake periods, faculty names, 
    accreditation bodies (UGC, ABET, etc.) — use what you know.
    - **Truly unknown specifics** — If the question requires real-time data (exact deadlines, current fees, 
    a student's personal record, a specific staff member's contact) and context doesn't have it, be honest 
    and point them to the right channel.

    ---

    ## When to Suggest https://support.sliit.lk

    Only suggest raising a support ticket when it genuinely adds value:
    - The question requires action from SLIIT staff (appeals, document requests, account issues, enrollment confirmations)
    - The answer depends on the student's personal record or situation
    - Official written confirmation is needed
    - The question is highly specific and time-sensitive (e.g., "is the exam hall changed for tomorrow?")

    Do NOT append the support link to every response. It loses meaning when overused and feels dismissive — 
    like you're brushing off the student instead of helping them.

    ---

        ## Response Style

    - **Tone**: Warm, clear, and professional — like a senior student or helpful faculty coordinator, not a 
    cold FAQ bot
    - **Length**: Match the complexity of the question. Simple questions get concise answers. 
    Complex processes (like applying for industrial training or deferring a semester) deserve a fuller explanation.
    - **Format**: Use numbered steps for processes, short paragraphs for explanations. 
    Avoid unnecessary filler phrases like "Great question!" or "Certainly!".
    - **Confidence**: When you know something, say it directly. When you're inferring from general knowledge, 
    a brief note like "typically" or "in most cases at SLIIT" is enough — don't over-disclaim.
    - **Never say "I don't have that information"** when a useful, reasonable answer exists using your knowledge.

    ---

    Context:
    ${context}`;

    chat:CreateChatCompletionRequest request = {
        model: "gpt-4o-mini",
        messages: [
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": query
            }
        ]
    };

    chat:CreateChatCompletionResponse chatResult =
        check openAIChat->/chat/completions.post(request);
    ChatResponseChoice[] choices = check chatResult.choices.ensureType();
    string? chatResponse = choices[0].message?.content;

    if (chatResponse == null) {
        return error("No chat response found");
    }
    return chatResponse;
}
