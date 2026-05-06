import ballerina/http;
import ballerina/log;
import ballerinax/ai.agent;

listener agent:Listener sliitSupportAgentLister = new (listenOn = check http:getDefaultListener());

isolated function handleChat(agent:ChatReqMessage request) returns agent:ChatRespMessage|error {
    string agentResponse = check llmChat(request.message);
    return {message: agentResponse};
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173", "https://sliit-support.vercel.app", "https://sliit-support-e74opo6h9-chamalsena.vercel.app"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        allowHeaders: ["content-type", "authorization", "x-api-key"],
        exposeHeaders: ["content-type"],
        maxAge: 86400
    }
}
service /api on sliitSupportAgentLister {
    isolated resource function options chat() returns http:Response {
        http:Response response = new;
        response.statusCode = 204;
        return response;
    }

    isolated resource function post chat(@http:Payload agent:ChatReqMessage request) returns agent:ChatRespMessage|error {
        log:printInfo("POST /api/chat: " + request.message);
        agent:ChatRespMessage|error result = handleChat(request);

        if result is error {
            log:printError("Chat handler failed", 'error = result);
            return result;
        }
        return result;
    }
}
