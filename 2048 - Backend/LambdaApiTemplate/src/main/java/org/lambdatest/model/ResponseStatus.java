package org.lambdatest.model;

public enum ResponseStatus {
    SUCCESS("success"),
    ERROR("error"),
    WARNING("warning");

    private final String description;

    ResponseStatus(final String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return description;
    }
}