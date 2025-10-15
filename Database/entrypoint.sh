#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to start
echo "Waiting for SQL Server to start..."
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1; do
    sleep 1
done
echo "SQL Server is up!"

# Apply SQLTableScript.sql
echo "Applying SQLTableScript.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d master -i /usr/src/app/SQLTableScript.sql
if [ $? -eq 0 ]; then
    echo "Script applied, keeping container running..."
else
    echo "Error applying SQLTableScript.sql" >&2
    exit 1
fi

# Keep the container running by waiting on the SQL Server process
wait