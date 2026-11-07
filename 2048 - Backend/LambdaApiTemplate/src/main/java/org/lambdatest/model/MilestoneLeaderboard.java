package org.lambdatest.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.lambdatest.ops.DatabaseOperations;
import org.lambdatest.ops.DynamoDbOperations;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class MilestoneLeaderboard {
    private final String milestoneName;
    private List<UserScore> leaderboardData;
    private final int MAX_SIZE = 10;
    private final DatabaseOperations dbOps;

    public MilestoneLeaderboard(String milestoneName, String dbType) {
        this.milestoneName = milestoneName;
        this.leaderboardData = List.of();
        if (Objects.equals(dbType, "DynamoDB")) {
            dbOps = new DynamoDbOperations();
        }
        else {
            throw new IllegalArgumentException("Invalid Database Type: "+dbType);
        }
    }

    public MilestoneLeaderboard loadLeaderboardFromDatabase() throws JsonProcessingException {
        this.leaderboardData = dbOps.fetchMilestoneLeaderboardWithName(this.milestoneName);
        return this;
    }

    public String getMilestoneName() {
        return milestoneName;
    }

    public List<UserScore> getLeaderboardData() {
        return leaderboardData;
    }

    public void updateLeaderboard(UserScore candidate) {
        ArrayList<UserScore> leaderboard = new ArrayList<UserScore>(leaderboardData);
        boolean candidateInserted = false;
        for (int i=0; i < leaderboard.size(); i++) {
            if (candidate.isLessThan(leaderboard.get(i))) {
                leaderboard.add(i,candidate);
                if (leaderboard.size() > MAX_SIZE) {
                    leaderboard.remove(leaderboard.size() - 1);
                }
                candidateInserted = true;
                break;
            }
        }
        if (!candidateInserted && leaderboard.size() < MAX_SIZE) {
            leaderboard.add(leaderboard.size(),candidate);
        }
        leaderboardData = leaderboard;
    }

    public void saveLeaderboardInDatabase() throws JsonProcessingException {
        dbOps.updateDatabaseLeaderboard(milestoneName, leaderboardData);
    }
}
