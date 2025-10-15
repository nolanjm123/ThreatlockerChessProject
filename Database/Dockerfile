FROM mcr.microsoft.com/mssql/server:2019-latest

USER root
RUN mkdir -p /var/opt/mssql /usr/src/app && \
    chmod -R 777 /var/opt/mssql /usr/src/app

COPY SQLTableScript.sql /usr/src/app/SQLTableScript.sql
COPY init-db.sh /usr/src/app/init-db.sh
RUN chmod +x /usr/src/app/init-db.sh

ENV PATH="$PATH:/opt/mssql-tools18/bin"

USER mssql
CMD ["/bin/bash", "/usr/src/app/init-db.sh"]