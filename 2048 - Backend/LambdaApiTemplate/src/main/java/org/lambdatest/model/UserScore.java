package org.lambdatest.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserScore {
    @JsonProperty("userName")
    private String userName;
    @JsonProperty("timeTaken")
    private Integer timeTaken;

    public UserScore() {}

    public UserScore(String userName, Integer timeTaken) {
        this.userName = userName;
        this.timeTaken = timeTaken;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }

    public boolean isLessThan(UserScore u2) {
        return this.timeTaken < u2.getTimeTaken();
    }

    @Override
    public String toString() {
        return "UserScore{" +
                "userName='" + userName + '\'' +
                ", timeTaken=" + timeTaken +
                '}';
    }
}
