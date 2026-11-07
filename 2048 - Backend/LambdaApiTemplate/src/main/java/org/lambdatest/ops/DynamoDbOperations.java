package org.lambdatest.ops;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.lambdatest.model.UserScore;

import java.util.List;
import java.util.Map;

public class DynamoDbOperations implements DatabaseOperations {
    private static final AmazonDynamoDB ddb = AmazonDynamoDBClientBuilder.defaultClient();
    private static final String TABLE_NAME = "TwoZeroFourEightData";
    private static final String PARTITION_KEY = "milestone_name";
    private static final String LEADERBOARD_KEY = "milestone_leaderboard";
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public List<UserScore> fetchMilestoneLeaderboardWithName(String milestoneName) throws JsonProcessingException {
        //add milestoneName validation power of 2 and less than 2048

        Map<String, AttributeValue> requestColumnAndValue
                = Map.of(PARTITION_KEY,new AttributeValue(milestoneName));

        GetItemRequest request = new GetItemRequest().withTableName(TABLE_NAME).withKey(requestColumnAndValue);

        Map<String, AttributeValue> results = ddb.getItem(request).getItem();

        return mapper.readValue(results.get(LEADERBOARD_KEY).getS(),new TypeReference<List<UserScore>>(){});
    }

    @Override
    public void updateDatabaseLeaderboard(String milestoneName, List<UserScore> leaderboardData) throws JsonProcessingException {
        String leaderboardString = mapper.writeValueAsString(leaderboardData);

        Map<String, AttributeValue> requestColumnAndValue
                = Map.of(PARTITION_KEY,new AttributeValue(milestoneName));

        Map<String, AttributeValueUpdate> updateColumnAndValue
                = Map.of(LEADERBOARD_KEY,new AttributeValueUpdate(new AttributeValue(leaderboardString),AttributeAction.PUT));

        ddb.updateItem(TABLE_NAME, requestColumnAndValue, updateColumnAndValue);
    }
}
