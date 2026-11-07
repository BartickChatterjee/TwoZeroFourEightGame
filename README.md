# 2048 Game

A browser-based version of **2048** with a running timer and milestone leaderboards. The frontend is built with plain HTML, CSS, and JavaScript. The optional leaderboard service is a Java AWS Lambda API backed by Amazon DynamoDB.

## Play
http://my-2048-game-s3bucket.s3-website.ap-south-1.amazonaws.com

## Features

- Play with the arrow keys or **WASD** keys, or use the on-screen directional controls.
- Track elapsed time while playing.
- Record completion times for tile milestones from **32** through **2048**.
- View leaderboard times by milestone.
- Responsive game layout for desktop and mobile browsers.

## Repository layout

```text
2048 - Frontend/                 Browser game files
2048 - Backend/LambdaApiTemplate/ Java Lambda API source and Maven build
Documentation.pdf                Project documentation
```

## Run the game

The frontend has no package manager or build step. Open `2048 - Frontend/2048_index.html` in a modern browser, or serve the `2048 - Frontend` directory with any static HTTP server. Serving it over HTTP is recommended for consistent browser behavior.

The frontend currently points to a deployed API endpoint for leaderboard requests. To use another endpoint, edit `backendApiUrl` near the top of `2048 - Frontend/2048_script.js`. If no compatible API is available, the game board can still be played, but leaderboard requests and score submissions will not work.

## Backend

The backend is an AWS Lambda handler exposed through API Gateway. It supports leaderboard retrieval and score updates, with leaderboard data stored in DynamoDB.

### Build

Requirements: JDK 17 and Maven.

```bash
cd "2048 - Backend/LambdaApiTemplate"
mvn package
```

The Maven Shade plugin packages the application and its dependencies into a deployable JAR under `target/`. Configure the Lambda handler as `org.lambdatest.handler.LambdaHandler` and connect it to an API Gateway HTTP API. The Lambda execution role also needs access to the DynamoDB table expected by `DynamoDbOperations`. Configure CORS to allow the frontend origin and the `POST` and `OPTIONS` methods.

The frontend sends JSON requests with `requestType` values `getLeaderboard` and `updateLeaderboard`. Set the API URL in the frontend to the deployed endpoint before using leaderboard features.

## How to play

Enter a name when prompted, then combine matching numbered tiles by moving them up, down, left, or right. Each successful move adds a new tile. Continue merging tiles to reach the milestones; completion times are submitted to the corresponding leaderboard.

## Tech stack

- HTML, CSS, and vanilla JavaScript
- Java 17 and Maven
- AWS Lambda, API Gateway, and DynamoDB