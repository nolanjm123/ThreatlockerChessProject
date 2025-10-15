#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Store the SQL Server process ID
SQL_PID=$!

# Wait for SQL Server to start
echo "Waiting for SQL Server to start..."
TIMEOUT=60
COUNT=0
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1; do
    sleep 1
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $TIMEOUT ]; then
        echo "SQL Server failed to start within $TIMEOUT seconds" >&2
        exit 1
    fi
done
echo "SQL Server is up!"

# Debug: Print available databases
echo "Listing databases before check..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT name FROM sys.databases"

# Check if ChessDb exists
echo "Checking for ChessDb..."
DB_EXISTS=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT CASE WHEN EXISTS (SELECT 1 FROM sys.databases WHERE name = 'ChessDb') THEN 1 ELSE 0 END" -h -1 -W | grep -E '^[0-1]$')
EXIT_CODE=$?
echo "DB_EXISTS raw output: $DB_EXISTS"
echo "sqlcmd exit code: $EXIT_CODE"

if [ $EXIT_CODE -ne 0 ]; then
    echo "Error checking database existence" >&2
    exit 1
fi

if [ "$DB_EXISTS" = "0" ]; then
    # Apply SQLTableScript.sql only if DB doesn't exist
    echo "Applying SQLTableScript.sql..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -d master -i /usr/src/app/SQLTableScript.sql
    if [ $? -eq 0 ]; then
        echo "Script applied successfully."
    else
        echo "Error applying SQLTableScript.sql" >&2
        exit 1
    fi
else
    echo "ChessDb already exists, skipping script application."
fi

# Debug: Verify database and user creation
echo "Verifying ChessDb and chessuser..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT name FROM sys.databases WHERE name = 'ChessDb'; SELECT name, type_desc FROM sys.server_principals WHERE name = 'chessuser'"

# Keep container running by waiting for SQL Server process
echo "Keeping container running..."
wait $SQL_PID