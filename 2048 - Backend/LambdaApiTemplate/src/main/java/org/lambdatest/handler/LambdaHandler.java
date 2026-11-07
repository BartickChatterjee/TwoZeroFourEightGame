package org.lambdatest.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import org.lambdatest.service.ProcessService;

import java.util.Map;

public class LambdaHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {
    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent event, Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log("Request Handling Started on V1.0");

        String httpMethod = event.getRequestContext().getHttp().getMethod();
        String body = event.getBody();

        if (isPreFlightRequest(httpMethod)) {
            logger.log("Handling Preflight Request");
            return APIGatewayV2HTTPResponse.builder()
                    .withStatusCode(204)
                    .withHeaders(Map.of("Access-Control-Allow-Origin", "*",
                            "Access-Control-Allow-Methods", "POST, OPTIONS",
                            "Access-Control-Allow-Headers", "Content-Type, Authorization"))
                    .build();
        }

        ProcessService service = new ProcessService("DynamoDB");
        Map<String, String> responseBody = service.processRequest(body);

        Map<String, String> responseHeaders = Map.of("Content-Type", "application/json",
                                                    "Access-Control-Allow-Origin", "*",
                                                    "Access-Control-Allow-Methods", "POST, OPTIONS",
                                                    "Access-Control-Allow-Headers", "Content-Type, Authorization");
        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(Integer.parseInt(responseBody.get("statusCode")))
                .withHeaders(responseHeaders)
                .withBody(responseBody.get("content"))
                .build();
    }

    private boolean isPreFlightRequest(String httpMethod) {
        return "OPTIONS".equals(httpMethod);
    }
}