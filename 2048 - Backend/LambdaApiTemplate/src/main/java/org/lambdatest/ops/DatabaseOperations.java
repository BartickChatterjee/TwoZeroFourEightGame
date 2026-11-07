package org.lambdatest.ops;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.lambdatest.model.UserScore;

import java.util.List;

public interface DatabaseOperations {
    List<UserScore> fetchMilestoneLeaderboardWithName(String milestoneName) throws JsonProcessingException;
    void updateDatabaseLeaderboard(String milestoneName, List<UserScore> leaderboardData) throws JsonProcessingException;
}
