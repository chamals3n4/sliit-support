import ballerina/http;
import ballerinax/ai.agent;

listener agent:Listener sliitSupportAgentLister = new (listenOn = check http:getDefaultListener());

function handleChat(agent:ChatReqMessage request) returns agent:ChatRespMessage|error {
    string agentResponse = check llmChat(request.message);
    return {message: agentResponse};
}

service /api on sliitSupportAgentLister {
    resource function post chat(@http:Payload agent:ChatReqMessage request) returns agent:ChatRespMessage|error {
        return handleChat(request);
    }
}
