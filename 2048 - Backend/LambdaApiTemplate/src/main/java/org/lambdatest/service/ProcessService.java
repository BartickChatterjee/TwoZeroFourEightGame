package org.lambdatest.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.lambdatest.model.ApiResponse;
import org.lambdatest.model.MilestoneLeaderboard;
import org.lambdatest.model.ResponseStatus;
import org.lambdatest.model.UserScore;

import java.util.List;
import java.util.Map;

public class ProcessService {
    private String dbType;

    public ProcessService(String dbType) {
        this.dbType = dbType;
    }

    public Map<String, String> processRequest(String body) {
        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode node = mapper.readTree(body);
            String requestType = node.get("requestType").asText();
            JsonNode requestData = node.get("requestData");
            String milestoneName = requestData.get("milestone").asText();

            if (requestType.equals("getLeaderboard")) {
                MilestoneLeaderboard leaderboard = new MilestoneLeaderboard(milestoneName, dbType).loadLeaderboardFromDatabase();
                List<UserScore> leaderboardData = leaderboard.getLeaderboardData();
                ApiResponse getLeaderboardResponse = new ApiResponse(ResponseStatus.SUCCESS,"Successfully fetched leaderboard", leaderboardData);
                return Map.of("statusCode","200",
                        "content",objectToJsonStringResponse(getLeaderboardResponse));
            }
            else if (requestType.equals("updateLeaderboard")) {
                UserScore userScore = mapper.treeToValue(requestData.get("userScoreData"),UserScore.class);
                MilestoneLeaderboard leaderboard = new MilestoneLeaderboard(milestoneName, dbType).loadLeaderboardFromDatabase();
                leaderboard.updateLeaderboard(userScore);
                leaderboard.saveLeaderboardInDatabase();
                ApiResponse updateLeaderboardResponse = new ApiResponse(ResponseStatus.SUCCESS,"Successfully updated leaderboard", userScore);
                return Map.of("statusCode","201",
                        "content",objectToJsonStringResponse(updateLeaderboardResponse));
            }
            else {
                ApiResponse errorResponse = new ApiResponse(ResponseStatus.ERROR,"Invalid request type", "The request type provided is not recognized");
                return Map.of("statusCode","400",
                        "content",objectToJsonStringResponse(errorResponse));
            }
        } catch (JsonProcessingException e) {
            System.out.println(e.getMessage());
        }
        return Map.of("statusCode","400",
                "content","\"status\": \"error\", \"summary\": \"encountered JsonProcessingException\"");
    }

    private String objectToJsonStringResponse(Object obj) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(obj);
    }
}
