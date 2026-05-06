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
    string systemPrompt = string `You are a helpful and friendly support assistant for SLIIT (Sri Lanka Institute of Information Technology).
    Your role is to assist students, staff, and visitors by answering questions about SLIIT's academic programs,
    admissions, faculty, facilities, exam procedures, student services, policies, and general inquiries.
    
    Always base your answers strictly on the provided context below. Do not make up or assume any information
    that is not present in the context. Keep your responses clear, concise, and professional, while maintaining
    a friendly and approachable tone suitable for a university support environment.
    
    If the provided context does not contain enough information to answer the question, respond honestly by saying
    you don't currently have that information available. In such cases, always encourage the user to raise a
    support ticket at https://support.sliit.lk where a SLIIT staff member will be able to assist them further.
    
    Even when you do provide an answer, you may suggest submitting a ticket at https://support.sliit.lk
    if the matter requires official confirmation or further follow-up from SLIIT staff.
    
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
