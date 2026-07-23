# CineViewHos Backend

## Setup environment

### Requirements
- **Make**: Please refer to the installation instructions for your operating system.
- **Docker**: Docker Desktop can be a useful tool as well.
- **Docker-compose**

### Add variables

To set up your local environment, you will need to create a `.env` file in the root directory of the project. You can do this by copying the example file:
```
cp .env.example .env
```
This file contains the necessary environment variables to run the application.

### Development :whale:
In the root of the project, run the following command:
```
make start_project
```
After the command completes, verify that all containers are running.

#### 1. Run database migrations
Once the project is running with Docker, execute the following Docker command to run the migrations:
```
make migrate
```
#### 2. Load Cities Data
To populate the cities database (used for location-based services), run:
```
make cities_light
```

You are now ready to proceed.

#### Running Tests
To verify the behavior and functionality of the application, and to identify any errors or potential issues, please run the tests:
```
make test
```
### Windows-Specific Configuration docker-compose.yml
If you are running this project on a Windows machine, you need to modify the `docker-compose.yml` file to ensure the database volume works correctly.

Locate the postgres service within your `docker-compose.yml` file.

Find the volumes section for that service and replace the following line:
```
- - ./setup/docker/postgres:/var/lib/postgresql/data
+ - pgdata:/var/lib/postgresql/data
```
Finally, add the following block at the very end of the `docker-compose.yml` file, with no indentation:
```
volumes:
  pgdata:
```

### Issue on Windows with Localstack Script:
If you encounter the following error:
```
terraform_local | exec ./scripts/terraform-local.sh: no such file or directory
```
You might be using **CRLF** line endings in the script. To fix it:
- Navigate to:
  ```
  \backend\infrastructure\localstack\scripts\terraform-local.sh
  ```
- Open the file in your editor (e.g., VSCode).
- Change the **End of Line Sequence** from **CRLF** to **LF**.
- Save the file and rerun:
  ```
  make start_project
  ```

#### Access LocalStack DynamoDB Tables
- Go to [LocalStack Web UI for DynamoDB](https://app.localstack.cloud/inst/default/resources/dynamodb)
- **Create an account** if you haven’t already.
- Wait until the following tables are automatically created:

| Table Name              | Table Status | Table ARN                                                                 |
|-------------------------|--------------|---------------------------------------------------------------------------|
| `catalogs-dev`          | ACTIVE       | `arn:aws:dynamodb:us-east-1:000000000000:table/catalogs-dev`             |
| `product_categories-dev`| ACTIVE       | `arn:aws:dynamodb:us-east-1:000000000000:table/product_categories-dev`   |
| `products-dev`          | ACTIVE       | `arn:aws:dynamodb:us-east-1:000000000000:table/products-dev`             |


#### API documentation
After the project is running and migrations have been applied, access the API documentation at the following endpoint:
```
http://localhost:8000/docs/
```
This will take you to the Swagger API documentation page.

You can now interact with the application. The documentation contains important information about how to use the app. Please make sure to start by creating a user in the sign-up endpoint and then use the retrieved token to be able to interact with the other endpoints. Otherwise, the endpoints won't be available.

#### Conventional Commit
Please adhere to the following commit message format:

* **Commit**
    ```
    feat: Message Description
    ```
    Example:
    ```
    feat: Implement Create method for Client Status
    ```

- `feat`: Introduce a new feature or modify an existing one
- `fix`: Resolve an issue in the branch
- `docs`: Documentation updates
- `test`: Add new tests
- `refactor`: Technical debt


Please take a look at the merge PR descriptions. You'll find some other functionalities documentations.

Thank you for following these guidelines. I started the project on may 12 2024.
