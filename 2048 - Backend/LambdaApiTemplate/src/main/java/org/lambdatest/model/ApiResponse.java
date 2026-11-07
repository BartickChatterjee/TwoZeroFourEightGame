package org.lambdatest.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiResponse {
    @JsonProperty("status")
    private ResponseStatus status;

    @JsonProperty("summary")
    private String summary;

    @JsonProperty("content")
    private Object content;

    public ApiResponse(ResponseStatus status, String summary, Object content) {
        this.status = status;
        this.summary = summary;
        this.content = content;
    }
}